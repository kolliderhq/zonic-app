import React from 'react';

import includes from 'lodash-es/includes';

import { baseSocketClient } from 'classes/SocketClient';
import { CHANNELS, MESSAGE_TYPES, USER_TYPE, WS } from 'consts';
import {
	reduxStore,
	setBalances,
	setIsWsAuthenticated,
	setIsWsConnected,
	setMarkPrices,
	storeDispatch,
} from 'contexts';
import { setIndexes } from 'contexts/modules/prices';
import { useAppSelector } from 'hooks/redux';
import useIsWindowVisible from 'hooks/useIsWindowVisible';
import { setInitSymbols, addSymbols, setSymbolData } from 'contexts';
import { sort } from 'fast-sort';
import keys from 'lodash-es/keys';

const WATCH_TYPES = [
	CHANNELS.POSITION_STATES,
	CHANNELS.INDEX_VALUES,
	CHANNELS.MARK_PRICE,
	CHANNELS.BALANCES,
	CHANNELS.FUNDING_RATES,
	WS.MESSAGES.SYMBOLS.refineType,
];

export function useSocketData() {
	const [wsConnected, wsAuthenticated, apiKey, userType] = useAppSelector(state => [
		state.connection.isWsConnected,
		state.connection.isWsAuthenticated,
		state.connection.apiKey,
		state.user.data.type,
	]);
	const visible = useIsWindowVisible();

	React.useEffect(() => {
		if (!wsAuthenticated && apiKey !== '') {
			authorizeClientAndSubscribe(apiKey);
		}
	}, [wsAuthenticated, apiKey]);

	React.useEffect(() => {
		if (userType !== USER_TYPE.PRO) return;
		authorizeClientAndSubscribe(apiKey);
	}, [userType]);

	React.useEffect(() => {}, []);

	React.useEffect(() => {
		const channelListener = msg => {
			if (!includes(WATCH_TYPES, msg?.type)) return;
			updateChannelData(msg);
		};
		baseSocketClient.connect('', data => {
			storeDispatch(setIsWsConnected(true));
			baseSocketClient.addEventListener(channelListener);
		});
	}, []);

	React.useEffect(() => {
		if (!wsConnected) return;
		if (visible) {
			if (wsAuthenticated) {
				baseSocketClient.socketSend(MESSAGE_TYPES.BALANCES, {}, null, null);
			}
			baseSocketClient.socketSend(MESSAGE_TYPES.SYMBOLS, {}, null, null);
			baseSocketClient.requestChannelSubscribe(CHANNELS.MARK_PRICE, []);
			baseSocketClient.requestChannelSubscribe(CHANNELS.INDEX_VALUES, []);
		} else {
			if (wsAuthenticated) {
				baseSocketClient.requestChannelUnsubscribe(CHANNELS.POSITION_STATES, []);
			}
			baseSocketClient.requestChannelUnsubscribe(CHANNELS.MARK_PRICE, []);
			baseSocketClient.requestChannelUnsubscribe(CHANNELS.INDEX_VALUES, []);
		}
	}, [visible, wsConnected]);
}

const authorizeClientAndSubscribe = async (apiKey: string) => {
	baseSocketClient.authorizeClient(apiKey, () => {
		setTimeout(() => {
			storeDispatch(setIsWsAuthenticated(true));
			baseSocketClient.socketSend(MESSAGE_TYPES.BALANCES, {}, null, null);
			const { symbols, symbolIndex } = reduxStore.getState().symbols;
			baseSocketClient.requestChannelSubscribe(CHANNELS.ORDERBOOK_LEVEL2, [symbols[symbolIndex]]);
			baseSocketClient.requestChannelSubscribe(CHANNELS.MARK_PRICE, []);
			baseSocketClient.requestChannelSubscribe(CHANNELS.INDEX_VALUES, []);
		}, 100);
	});
};

const updateChannelData = (msg: any) => {
	// console.log('updateChannelData', msg.type, msg.data);
	//   the one exception due to legacy code
	if (msg?.type === CHANNELS.MARK_PRICE) {
		const symbol = msg.data?.symbol;
		if (!symbol) return;
		storeDispatch(setMarkPrices({ symbol, value: msg.data.price }));
	} else if (msg?.type === CHANNELS.INDEX_VALUES) {
		if (!msg.data?.symbol) return;
		storeDispatch(setIndexes({ symbol: msg.data.symbol, value: msg.data.value }));
	} else if (msg?.type === CHANNELS.BALANCES) {
		if (!msg.data?.cash) return;
		storeDispatch(setBalances(msg.data));
	} else if (msg.type === WS.MESSAGES.SYMBOLS.refineType) {
		const symbolArr = [...Array.from(new Set(['BTCUSD.PERP', ...sort(keys(msg.data)).asc(v => v)]))];
		storeDispatch(setInitSymbols(symbolArr));
		storeDispatch(addSymbols(symbolArr));
		setTimeout(() => storeDispatch(setSymbolData(msg.data)), 0);
	} else {
		console.error(`unknown type - ${msg.type}`);
		console.log(msg.data);
	}
};
