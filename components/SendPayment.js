import { ImArrowLeft2 } from 'react-icons/im';

import { TABS, UMBREL_MESSAGE_TYPES } from 'consts';
import { setTab } from 'contexts/modules/layout';
import { useAppDispatch } from 'hooks';
import ligtningPayReq from 'bolt11';
import { useEffect, useState } from 'react';
import { baseUmbrelSocketClient } from 'classes/UmbrelSocketClient';
import Loader from './Loader';
import { displayToast, TOAST_LEVEL } from 'utils/toast';

export const SendPayment = () => {
	let dispatch = useAppDispatch();

	const [invoice, setInvoice] = useState("");
	const [decodedInvoice, setDecodedInvoice] = useState(null)
	const [amount, setAmount] = useState("")
	const [expiry, setExpiry] = useState("")
	const [isLoading, setIsLoading] = useState(false)

	const onPayInvoice = () => {
		{
			if (!invoice) return
			setIsLoading(true)
			baseUmbrelSocketClient.socketSend(UMBREL_MESSAGE_TYPES.SEND_PAYMENT, { paymentRequest: invoice }, data => {
				setIsLoading(false)
				dispatch(setTab(TABS.OVERVIEW))
				displayToast('Payment Sent.', {
					type: 'success',
					level: TOAST_LEVEL.INFO,
				});
			});
		}
	}

	useEffect(() => {
		if (!invoice) return
		try {
			let decoded = ligtningPayReq.decode(invoice)
			console.log(decoded)
			setDecodedInvoice(decoded)
			setAmount((decoded.millisatoshis / 1000).toString())
			let time = new Date(decoded.timeExpireDate)
			setExpiry(time.toUTCString())
		} catch (err) {
			setDecodedInvoice(null)
			setAmount("")
			setExpiry("")
		}
	}, [invoice, amount, expiry])

	return (
		<div className="h-full flex flex-col">
			<div className="flex flex-row w-full text-4xl text-gray-600">
				<div className="absolute">
					<button onClick={() => dispatch(setTab(TABS.OVERVIEW))}>
						<ImArrowLeft2 />
					</button>
				</div>
				<div className="text-lg mx-auto">Send Payment</div>
			</div>
			{
				isLoading ? (
					<div className="text-gray-600 m-auto">
						<Loader color={"#7372f7"} text="Sending Payment" />
					</div>
				) : (

					<div className="h-full mt-8">
						<div className="text-left text-gray-600">Paste your invoice</div>
						<div className="text-gray-600 border rounded-lg border-gray-100 p-2 mt-2">
							<textarea rows="4" cols="50" className="w-full rounded-lg" placeholder='' onChange={e => setInvoice(e.target.value)}>
							</textarea>
						</div>
						<div className="grid grid-cols-2 divide-x divide-gray-100 mt-8 px-8">
							<div className="text-left">
								<div className="text-gray-600">Amount (sats):</div>
								<div className="text-gray-800 text-2xl">{amount} <span className="text-sm"></span></div>
							</div>
							<div>
								<div className="text-gray-600">Expiry:</div>
								<div className="text-gray-800 text-sm">{expiry} <span className="text-sm"></span></div>
							</div>
						</div>
					</div>

				)
			}
			<div className="">
				<button className="w-48 py-3 px-3 bg-theme-main rounded-lg" onClick={() => onPayInvoice()}>
					Pay Invoice
				</button>
			</div>
		</div>
	);
};
