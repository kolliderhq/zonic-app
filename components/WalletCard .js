import { useEffect, useState } from 'react';
import { FaEthereum } from 'react-icons/fa';
import { HiOutlineCurrencyDollar } from 'react-icons/hi';
import { MdArrowForwardIos, MdOutlineArrowBackIos } from 'react-icons/md';
import { RiBitCoinLine, RiDownloadLine, RiExchangeLine, RiSendPlane2Line } from 'react-icons/ri';

import { CURRENCY_NAME_MAP } from 'consts/misc/currency';
import { useAppDispatch, useAppSelector } from 'hooks';
import { roundDecimal } from 'utils/format';
import { setSelectedWallet } from 'contexts/modules/layout';

export const WalletCard = () => {
	const [balances, localBalance, wallets, availableWallets, selectedWallet] = useAppSelector(state => [
		state.trading.balances,
		state.umbrel.localBalance,
		state.wallets.wallets,
		state.wallets.availableWallets,
		state.layout.selectedWallet,
	]);
	const dispatch = useAppDispatch();
	const [selectedWalletData, setSelectedWalletData] = useState({});
	const [selectedCurrencyIndex, setSelectedCurrencyIndex] = useState(0)
	const [selectedWalletBalance, setSelectedWalletBalance] = useState(0)

	useEffect(() => {
		let wallet = wallets[selectedWallet]? wallets[selectedWallet]: null
		if (!wallet) return
		setSelectedWalletData(wallet)
		setSelectedWalletBalance(roundDecimal(wallet.balance, wallet.dp))
	}, [wallets, selectedWallet])

	useEffect(() => {
		if (selectedCurrencyIndex > availableWallets.length - 1)  {
			return 
			// let i = 0;
			// let curr = availableWallets[i]
			// dispatch(setSelectedWallet(curr))
			// setSelectedCurrencyIndex(i)
		}
		if (selectedCurrencyIndex < 0) {
			return
			// let i = availableWallets.length - 1
			// let curr = availableWallets[i]
			// setSelectedCurrencyIndex(i)
			// dispatch(setSelectedWallet(curr))
		}
		let curr = availableWallets[selectedCurrencyIndex]
		dispatch(setSelectedWallet(curr))
	}, [selectedCurrencyIndex])

	const renderIcon = currency => {
		if (currency === 'BTC') {
			return <RiBitCoinLine className="mx-auto" />;
		} else if (currency === 'USD') {
			return '🇺🇸';
		} else if (currency === 'ETH') {
			return <FaEthereum className="mx-auto" />;
		}
	};

	return (
		<div className="relative">
			<div className="absolute flex h-full text-2xl text-gray-600 w-full justify-between">
					<div
						className="my-auto ml-8 cursor-pointer transition ease-in-out hover:-translate-y-1 hover:scale-110"
						onClick={() => setSelectedCurrencyIndex(selectedCurrencyIndex -=1)}>
						<MdOutlineArrowBackIos />
					</div>
					<div
						className="my-auto mr-8 cursor-pointer transition ease-in-out hover:-translate-y-1 hover:scale-110"
						onClick={() => setSelectedCurrencyIndex(selectedCurrencyIndex +=1)}>
						<MdArrowForwardIos />
					</div>
			</div>
			<div className="text-black m-auto w-full text-8xl text-yellow-600">{renderIcon(selectedWallet)}</div>
			<div className="flex flex-col mt-4">
				<div className="text-lg text-gray-700"> {CURRENCY_NAME_MAP[selectedWallet]} </div>
				<div className="text-4xl text-gray-600 mt-4"> {selectedWalletBalance} <span className="text-xl">{selectedWalletData.denomination}</span></div>
				<p className="text-xs text-gray-400 mt-4"> </p>
			</div>
		</div>
	);
};
