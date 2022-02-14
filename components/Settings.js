import { useAppDispatch, useAppSelector } from 'hooks';
import { TABS } from 'consts';
import { setTab } from 'contexts/modules/layout';
import { ImArrowLeft2 } from 'react-icons/im';
import { API_NAMES } from 'consts';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { getSWROptions } from 'utils/fetchers';

export const Settings = () => {
	const dispatch = useAppDispatch()
	const [userData,  apiKey] = useAppSelector(state => [state.user.data, state.connection.apiKey])
	const [username, setUsername] = useState("");

	const { data, isValidating } = useSWR(
		apiKey !== '' ? [API_NAMES.WHOAMI] : undefined,
		getSWROptions(API_NAMES.WHOAMI)
	);

	useEffect(() => {
		if (!data) return
		setUsername(data.username)
	}, [data])

	return (
		<div className="h-full flex flex-col">
			<div className="flex flex-row w-full text-4xl text-gray-600">
				<div className="absolute">
					<button onClick={() => dispatch(setTab(TABS.OVERVIEW))}>
						<ImArrowLeft2 />
					</button>
				</div>
				<div className="text-lg mx-auto">Settings</div>
			</div>
			<div className="flex flex-col text-gray-600 text-left">
				<div className="mt-6 text-gray-400">Username:</div>
				<div>{username}</div>
			</div>
		</div>
	)
}