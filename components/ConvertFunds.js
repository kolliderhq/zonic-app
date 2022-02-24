import { useEffect, useMemo, useState } from 'react';
import { FaExchangeAlt } from 'react-icons/fa';
import { ImArrowLeft2 } from 'react-icons/im';

import cn from 'clsx';

import { baseUmbrelSocketClient } from 'classes/UmbrelSocketClient';
import { TABS } from 'consts';
import { setTab } from 'contexts/modules/layout';
import { useAppDispatch, useAppSelector, useSymbolData } from 'hooks';
import { useMarkPrice } from 'hooks/useMarkPrice';
import { roundDecimal } from 'utils/format';

import { WrapBaseDialog } from './dialogs';
import { ConfirmConversion } from './dialogs/ConfirmConversion';
import { displayToast, TOAST_LEVEL } from 'utils/toast';
import Loader from './Loader';

export const ConvertFunds = () => {
	let dispatch = useAppDispatch();
	let [wallets] = useAppSelector(state => [state.wallets.wallets]);
	let markPrice = useMarkPrice('BTCUSD.PERP');

	const [isBuying, setIsBuying] = useState(true);
	const [dollarConversionAmount, setDollarConversionAmount] = useState(0);
	const [dollarConversionAmountInt, setDollarConversionAmountInt] = useState(0);
	const [inputIsValid, setInputIsValid] = useState(true);
	const [fees, setFees] = useState(0);
	const [contractValue, setContractValue] = useState(0);
	const [showConversionConfirmation, setShowConversionConfirmation] = useState(false);
	const [walletsHaveLoaded, setWalletsHaveLoaded] = useState(false)

	const onChangeBuyUSD = isBuyUSD => {
		setIsBuying(isBuyUSD);
	};

	const onMakeConversion = () => {
		if (!inputIsValid) {
			displayToast('Please chose a valid dollar input.', {
				type: 'error',
				level: TOAST_LEVEL.ERROR,
			});
		} else if (parseInt(dollarConversionAmount) <= 0) {
			displayToast('Please chose a dollar amount greater than 0.', {
				type: 'error',
				level: TOAST_LEVEL.ERROR,
			});
		} else if (contractValue > wallets.BTC.balance && isBuying) {
			displayToast("You don't have enough Bitcoin to make this conversion.", {
				type: 'error',
				level: TOAST_LEVEL.ERROR,
			});
		} else if (parseInt(dollarConversionAmount) > Math.round(wallets.USD.balance) && !isBuying) {
			displayToast("You don't have enough USD to make this conversion.", {
				type: 'error',
				level: TOAST_LEVEL.ERROR,
			});
		} else {
			setShowConversionConfirmation(true)
		}
	};

	useEffect(() => {
		console.log(wallets)
		if (!wallets.USD || !wallets.BTC) return
		setWalletsHaveLoaded(true)
	}, [wallets, walletsHaveLoaded])

	useEffect(() => {
		if (isNaN(parseInt(dollarConversionAmount))) {
			setInputIsValid(false);
			setFees(0);
			setContractValue(0);
			return;
		} else {
			setInputIsValid(true);
		}
		let qty = parseInt(dollarConversionAmount);
		setDollarConversionAmountInt(qty);
		let cV = roundDecimal((1 / markPrice) * qty * 100000000, 0);
		let f = contractValue * 0.00075;
		setFees(f);
		setContractValue(cV);
	}, [dollarConversionAmount, fees, contractValue]);

	return (
		<div className="lex flex-col h-full text-gray-400">
			{showConversionConfirmation ? (
				<div className="h-full">
					<ConfirmConversion
						quantity={dollarConversionAmountInt}
						isBuying={isBuying}
						show={setShowConversionConfirmation}
					/>
				</div>
			) : (
				<div className="h-full flex flex-col">
					<div className="flex flex-row w-full text-4xl text-gray-600">
						<div className="absolute">
							<button onClick={() => dispatch(setTab(TABS.OVERVIEW))}>
								<ImArrowLeft2 />
							</button>
						</div>
						<div className="text-lg mx-auto">Convert Funds</div>
					</div>
					<div className="mt-5 flex flex-col h-full">
						<div className="flex flex-row w-full gap-4">
							<div
								className={cn(isBuying && 'border-b border-b-2') + ' cursor-pointer'}
								onClick={() => onChangeBuyUSD(true)}>
								Buy USD
							</div>
							<div
								className={cn(!isBuying && 'border-b border-b-2') + ' cursor-pointer'}
								onClick={() => onChangeBuyUSD(false)}>
								Sell USD
							</div>
						</div>
						{
							!walletsHaveLoaded ? (
								<Loader color={'#7372f7'} />
							) : (
								<div className="h-full flex flex-col">
									<div className="m-auto">
										<div className="mt-5 flex grid grid-cols-2 divide-x">
											<div className="text-left pl-4">
												{isBuying ? (
													<div className="w-full">
														BTC balance:{' '}
														<div className="text-xl text-gray-600 w-full">
															{roundDecimal(wallets['BTC'].balance, wallets['BTC'].dp) / 100000000}
														</div>
													</div>
												) : (
													<div className="w-full">
														USD balance:{' '}
														<div className="text-xl text-gray-600 w-full">
															{roundDecimal(wallets['USD'].balance, wallets['USD'].dp)}
														</div>
													</div>
												)}
											</div>
											<div className="text-left pl-4">
												<div>Bitcoin Price: </div>
												<div className="text-xl text-gray-600">${markPrice}</div>
											</div>
										</div>
										<div className="mt-4">
											<div>
												<div className="flex text-lg">
													How much USD do you want to{' '}
													<span className="ml-2 text-gray-700">{isBuying ? 'buy' : 'sell'}</span>?
												</div>
												<div className="flex rounded-md border-2 border-gray-300 focus:border-gray-300 hover:border-gray-300 mt-4 p-2 text-gray-600">
													<input
														// onFocus={() => console.log('}
														className="input-default inline-block w-full h-12 text-2xl"
														type="number"
														onInput={e => setDollarConversionAmount(e.target.value)}
													// value={}
													/>
													<div className="m-auto text-2xl border-l-2 pl-2 text-gray-600"> USD </div>
												</div>
												<div className="text-red-500">
													{!inputIsValid && <p className="text-sm">Input must be an integer.</p>}
												</div>
											</div>
										</div>
										<div className="mt-2">
											<div className="w-full text-left text-lg">
												{isBuying ? <div>You will have to pay </div> : <div>You will get </div>}
											</div>
											<div className="text-3xl">
												{contractValue} <span className="text-lg">SATS</span>
											</div>
										</div>
										<div className="mt-4">
											<div className="">Fees:</div>
											<div className="text-xl">{roundDecimal(fees, 0)} Sats</div>
										</div>
									</div>
									<div className="h-full relative">
										<div className="mt-4 bottom-0 absolute w-full">
											<button
												className="border border-theme-main px-4 py-2 rounded-lg border-2 text-theme-main font-bold w-full"
												onClick={() => onMakeConversion()}>
												Convert
											</button>
										</div>
									</div>
								</div>
							)
						}
					</div>
				</div>
			)}
		</div>
	);
};
