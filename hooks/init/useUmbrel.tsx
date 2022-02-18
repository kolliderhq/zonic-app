import React from 'react';

import store from 'store2';
import useSWR from 'swr';

import { auth } from 'classes/Auth';
import { baseSocketClient } from 'classes/SocketClient';
import { baseUmbrelSocketClient } from 'classes/UmbrelSocketClient';
import { API_NAMES, DIALOGS, MESSAGE_TYPES, SETTINGS, UMBREL_MESSAGE_TYPES, USER_TYPE, WS_CUSTOM_TYPES } from 'consts';
import {
	setIsUmbrelAuthenticated,
	setIsUmbrelConnected,
	setIsWsAuthenticated,
	setIsWsConnected,
	setPaymentInTransit,
	setViewing,
	setWallet,
	storeDispatch,
} from 'contexts';
import { setChannelBalances } from 'contexts/modules/umbrel';
import { useAppDispatch, useAppSelector } from 'hooks/redux';
import { fixed } from 'utils/Big';
import { LOG3 } from 'utils/debug';
import { getSWROptions } from 'utils/fetchers';
import { Balances } from 'utils/refiners/sockets';
import { TOAST_LEVEL, displayToast } from 'utils/toast';
import { FixedLengthArray } from 'utils/types/utils';
import { umbrelSendPayment, umbrelWithdraw } from 'utils/umbrel';
import { RiNodeTree } from 'react-icons/ri';

/**
 * Umbrel uses a work or error approach where if umbrel is unavailable it just throws an error toast
 */
export function useUmbrel() {
	const dispatch = useAppDispatch();
	const [isUmbrelAuthenticated, apiKey] = useAppSelector(state => [state.connection.isUmbrelAuthenticated, state.connection.apiKey]);

	useUmbrelAutoLogin();

	//	auto umbrel auth popup
	React.useEffect(() => {
		if (isUmbrelAuthenticated === true) {
			baseUmbrelSocketClient.getSynthWallets();
			return;
		}
		dispatch(setIsUmbrelAuthenticated(false));
	}, [isUmbrelAuthenticated]);

	React.useEffect(() => {
		if (process.env.NEXT_PUBLIC_UMBREL !== '1') return;
		baseUmbrelSocketClient.connect(
			async () => {
				dispatch(setIsUmbrelConnected(true));
				baseUmbrelSocketClient.addAnyEventListener(processUmbrelMsg);
			},
			() => {
				dispatch(setIsUmbrelConnected(false));
				dispatch(setIsUmbrelAuthenticated(false));
				baseUmbrelSocketClient.removeAnyEventListener(processUmbrelMsg);
				displayToast('Umbrel Connection Disconnected', {
					type: 'error',
					level: TOAST_LEVEL.CRITICAL,
					toastId: 'umbrel-connection-disconnected',
				});
			}
		);
	}, []);

	React.useEffect(() => {
		if (!apiKey || !isUmbrelAuthenticated) return
		baseUmbrelSocketClient.socketSend(UMBREL_MESSAGE_TYPES.AUTH_HEDGER, { token: apiKey }, data => {
			LOG3(data, 'kollider login');
			displayToast('Logged into Kollider successfully', {
				type: 'success',
				level: TOAST_LEVEL.INFO,
				toastId: 'umbrel-login-success',
			});
		});

	}, [apiKey, isUmbrelAuthenticated])

	useUmbrelToProcessPayments();
}

const useUmbrelAutoLogin = () => {
	// const [loggedIn, apiKey, isUmbrelUsable] = useAppSelector(state => [
	// 	state.user.data.type === USER_TYPE.PRO,
	// 	state.connection.apiKey,
	// 	state.connection.isUmbrelConnected && state.connection.isUmbrelAuthenticated,
	// ]);
	// const { data } = useSWR(
	// 	apiKey && isUmbrelUsable ? [API_NAMES.AUTH_LNURL, apiKey] : undefined,
	// 	getSWROptions(API_NAMES.AUTH_LNURL)
	// );

	// React.useEffect(() => {
	// 	if (!data?.lnurlAuth || loggedIn) return;
	// 	umbrelLogin(data.lnurlAuth);
	// }, [data, loggedIn]);
};

const umbrelLogin = (lnurl: string) => {
	console.log('umbrelLogin attempt ', lnurl);
};

const processUmbrelMsg = (type: any, msg: any) => {
	console.log('------------ UMBREL MSG --------------');
	console.log(type);
	console.log(msg);
	if (type === 'sendPayment') {
		if (msg.data.status === 'success') {
			storeDispatch(setPaymentInTransit(false));
		}
	} else if (type === 'getChannelBalances') {
		storeDispatch(
			setChannelBalances({
				localBalance: msg.data.local,
				remoteBalance: msg.data.remote,
			})
		);
	} else if (type == 'receivedPayment') {
		// In theory this should work but the lnd client seems to slow to update balances just after an invoice is settled
		baseUmbrelSocketClient.socketSend(UMBREL_MESSAGE_TYPES.GET_CHANNEL_BALANCE);
	} else if (type == 'getSynthWallets') {
		Object.entries(msg.data).map(([key, value]) => {
			let wallet = {
				balance: value['balance'],
				currencySymbol: key,
				denomination: value['denomination'],
				dp: value['dp'],
			};
			storeDispatch(setWallet({ currencySymbol: key, wallet }));
		});
	} else if (type == 'synthWallet') {
		let data = msg.data
		let wallet = {
			balance: data.balance,
			currencySymbol: data.currency_symbol,
			denomination: data.denomination,
			dp: data.dp
		};
		storeDispatch(setWallet({ currencySymbol: data.currency_symbol, wallet }));
	} else if (type === 'kolliderAuthentication') {
		if (msg.data.status === 'success') {
			setIsWsConnected(true)
			setIsWsAuthenticated(true)
		}
	}
	// console.log('Umbrel Event', msg);
};

const useUmbrelToProcessPayments = () => {
	const onlyWeblnIfEnabled = true;
	const dispatch = useAppDispatch();
	const [currentDialog, viewing, invoiceStore, isUmbrelConnected, balances] = useAppSelector(state => [
		state.layout.dialog,
		state.invoices.viewing,
		state.invoices,
		state.connection.isUmbrelConnected,
		state.trading.balances,
	]);
	const invoice = invoiceStore.invoices[invoiceStore.symbol]?.invoice;

	//	deposit / instant order invoice
	React.useEffect(() => {
		// console.log('invoice', viewing, invoice, isWeblnConnected);
		if (!viewing || !isUmbrelConnected || !invoice) return;
		umbrelSendPayment(invoice as string, () => {
			if (onlyWeblnIfEnabled) dispatch(setViewing(false));
		});
	}, [viewing]);

	//	settle invoice
	React.useEffect(() => {
		if (currentDialog !== DIALOGS.SETTLE_INVOICE) return;
		if (!isUmbrelConnected) return;
		umbrelWithdraw(Number(fixed(balances.cash, 0)));
	}, [currentDialog, balances]);

	useProcessAutoWithdrawUmbrel();
};

const useProcessAutoWithdrawUmbrel = () => {
	const [isUmbrelUsable, balances, weblnAutoWithdraw] = useAppSelector(state => [
		state.connection.isUmbrelConnected && state.connection.isUmbrelAuthenticated,
		state.trading.balances,
		state.settings.weblnAutoWithdraw,
	]) as FixedLengthArray<[boolean, Balances, number]>;

	const cash = Number(fixed(balances?.cash ? balances.cash : 0, 0));
	const ref = React.useRef<{ timestamp: number; timeout: ReturnType<typeof setTimeout> }>({
		timestamp: 0,
		timeout: null,
	});
	React.useEffect(() => {
		if (!isUmbrelUsable || weblnAutoWithdraw === 0) return;
		if (Number(cash) >= Number(weblnAutoWithdraw)) {
			ref.current.timestamp = Date.now();
			const current = ref.current.timestamp;
			ref.current.timeout = setTimeout(() => {
				if (current !== ref.current.timestamp) return;
				console.log('Umbrel Auto Withdraw attempt', cash);
				umbrelWithdraw(cash, res => {
					if (!res.data?.paymentRequest) {
						displayToast('Error requesting invoice from Umbrel', {
							type: 'error',
							level: TOAST_LEVEL.CRITICAL,
						});
						return;
					}
					const body = { amount: cash, invoice: res.data.paymentRequest };
					baseSocketClient.socketSend(MESSAGE_TYPES.WITHDRAWAL_REQUEST, body);
				});
			}, SETTINGS.LIMITS.WEBLN_WITHDRAW_TIMEOUT_MS);
		} else {
			//	cash was below the limit when requested
			if (ref.current.timeout) clearTimeout(ref.current.timeout);
		}
	}, [isUmbrelUsable, cash, weblnAutoWithdraw]);
};
