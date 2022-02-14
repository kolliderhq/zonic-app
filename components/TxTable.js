import { useEffect, useState } from 'react';
import { BsArrowRightShort } from 'react-icons/bs';
import { RiBitCoinFill } from 'react-icons/ri';

import useSWR from 'swr';

import { API_NAMES } from 'consts';
import { useAppSelector } from 'hooks';
import { getSWROptions } from 'utils/fetchers';
import { roundDecimal } from 'utils/format';

import Loader from './Loader';

const WALLET_TO_TRADE_SIDE= {
	BTC: "Bid",
	USD: "Ask"
}

export const TxTable = () => {
	const [apiKey, selectedWallet] = useAppSelector(state => [state.connection.apiKey, state.layout.selectedWallet]);
	const [rows, setRows] = useState([]);
	const [tableHasLoaded, setTableHasLoaded] = useState(false);

	const { data, isValidating } = useSWR(
		apiKey !== '' ? [API_NAMES.HISTORICAL_TRADES] : undefined,
		getSWROptions(API_NAMES.HISTORICAL_TRADES)
	);

	useEffect(() => {
		let newRows = [];
		if (!data) return;
		data.map(value => {
			if (value.symbol === 'BTCUSD.PERP') {
				if (value.side === WALLET_TO_TRADE_SIDE[selectedWallet]) {
					newRows.push(value);
				}
			}
		});
		setRows(newRows);
	}, [data, selectedWallet]);

	useEffect(() => {
		if (!tableHasLoaded && !isValidating) {
			setTableHasLoaded(true);
		}
	}, [isValidating]);

	return (
		<div className="mt-6 h-72 overflow-auto m-auto">
			{isValidating && !tableHasLoaded ? (
				<div className="m-auto h-full w-full">
					<Loader color={'black'} text={'Processing'} />
				</div>
			) : (
				<table className="text-black w-full h-full table-fixed">
					<thead className="sticky top-0 border-b border-b-4 border-gray-50 text-gray-400 text-left bg-white">
						<tr>
							<th></th>
							<th>Price ($)</th>
							<th>Amount {selectedWallet === "BTC"? "sats": "$"}</th>
						</tr>
					</thead>
					<tbody className="text-left text-gray-500">
						<>
							{rows.map(row => (
								<tr className="border-b border-gray-50 h-10" key={row.orderId}>
									<td className="flex flex-row h-full">
										{
											selectedWallet === "BTC"? (
										<div className="flex my-auto h-full mt-2">
											<div className="my-auto">🇺🇸</div>
											<div className="my-auto">
												<BsArrowRightShort />
											</div>
											<div className="my-auto">
												<RiBitCoinFill className="text-yellow-600" />
											</div>
										</div>
											): (
										<div className="flex my-auto h-full mt-2">
											<div className="my-auto">
												<RiBitCoinFill className="text-yellow-600" />
											</div>
											<div className="my-auto">
												<BsArrowRightShort />
											</div>
											<div className="my-auto">🇺🇸</div>
										</div>
											)
										}
									</td>
									<td>{row.price}</td>
									{
										selectedWallet === "BTC"? (

									<td>+ {roundDecimal((1 / row.price) * row.quantity * 100000000, 0)}</td>
										):
									<td>+ ${row.quantity}</td>
									}
								</tr>
							))}
						</>
					</tbody>
				</table>
			)}
		</div>
	);
};
