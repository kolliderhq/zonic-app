import { useAppDispatch, useAppSelector } from 'hooks';
import { TABS, UMBREL_MESSAGE_TYPES } from 'consts';
import { setTab } from 'contexts/modules/layout';
import { ImArrowLeft2 } from 'react-icons/im';
import { API_NAMES } from 'consts';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { getSWROptions } from 'utils/fetchers';
import { auth } from 'classes/Auth';
import { baseUmbrelSocketClient } from 'classes/UmbrelSocketClient';

export const Settings = () => {
	const dispatch = useAppDispatch()
	const [userData, apiKey] = useAppSelector(state => [state.user.data, state.connection.apiKey])
	const [username, setUsername] = useState("");

	const { data, isValidating } = useSWR(
		apiKey !== '' ? [API_NAMES.WHOAMI] : undefined,
		getSWROptions(API_NAMES.WHOAMI)
	);

	useEffect(() => {
		if (!data) return
		setUsername(data.username)
	}, [data])

	const onLogout = () => {
		auth.logoutUser()
		baseUmbrelSocketClient.socketSend(UMBREL_MESSAGE_TYPES.LOGOUT, {}, data => {
			console.log(data)
		})
	}

	const onCloseUSDAccount = () => {
		baseUmbrelSocketClient.socketSend(UMBREL_MESSAGE_TYPES.CLOSE_ACCOUNT, {}, data => {
			console.log(data)
		})
	}

	return (
		<div className="flex flex-col h-full">
			<div className="flex flex-row w-full text-4xl text-gray-600">
				<div className="absolute">
					<button onClick={() => dispatch(setTab(TABS.OVERVIEW))}>
						<ImArrowLeft2 />
					</button>
				</div>
				<div className="text-lg mx-auto">Settings</div>
			</div>
			<div className="flex flex-col text-gray-600 text-left">
				<div className="text-lg mt-6">Kollider</div>
				<div className="mt-4 text-gray-400">Username:</div>
				<div className="flex grid grid-cols-3">
					<div className="truncate ... col-span-2">{username}</div>
					<div className="col-span-1 text-right">
						<button className="underline underline-offset-2">Edit</button>
					</div>
				</div>
			</div>
			<div className="flex flex-col gap-4 border-t-2 border-gray-100 p-4 m-8">
				<div className="">
					<button className="px-3 py-3 bg-red-400 rounded-lg w-52" onClick={() => onCloseUSDAccount()}>Close USD Account</button>
				</div>
				<div className="">
					<button className="px-3 py-3 bg-red-400 rounded-lg w-52" onClick={() => onLogout()}>Logout</button>
				</div>
			</div>
		</div>
	)
}