import React from 'react';

import cn from 'clsx';

import { baseSocketClient } from 'classes/SocketClient';
import { useAppSelector } from 'hooks';
import { useSafeInterval } from 'hooks/useSafeInterval';

export const Footer = () => {
	return (
		<footer className="fixed bottom-0 left-0 w-full h-12 bg-white">
			<div className="w-full flex items-center h-8 z-80">
				<div className="grid grid-cols-3 w-full px-4">
					<div className="flex">
						<div>
							<SocketStatus />
						</div>
						<div className="ml-2">{process.env.NEXT_PUBLIC_UMBREL === '1' ? <UmbrelStatus /> : <WeblnStatus />}</div>
					</div>
					<div className="flex flex-col w-full">
						<a href="htts://kollider.xyz" className="mx-auto cursor-pointer">
						<div className="flex flex-col mx-auto">
							<div className="text-gray-800">Powered by </div>
							<div className="mx-auto">
							<img className="w-15 h-[15px]" src="/assets/logos/kollider_logo_black.png" />
							</div>
						</div>
						</a>
					</div>
					<div></div>
				</div>
			</div>
		</footer>
	);
};

const SocketStatus = () => {
	const [, updateState] = React.useState(true);
	const forceUpdate = React.useCallback(() => updateState(v => !v), []);
	const online = useAppSelector(state => state.connection.isOnline);
	const ticker = useSafeInterval(1000);
	React.useEffect(() => {
		const cbIndex = ticker.subscribe(() => {
			forceUpdate();
		});
		return () => {
			ticker.unsubscribe(cbIndex);
		};
	}, []);

	const [status, setStatus] = React.useState('bg-red-500');
	React.useEffect(() => {
		if (online && baseSocketClient.isReady) setStatus('bg-green-500');
		else setStatus('bg-red-500');
	}, [online, baseSocketClient.isReady]);

	return (
		<div className="h-full flex items-center text-gray-800">
			<div className={cn('h-2 w-2 rounded-full mr-1', status)} />
			<p className="text-xs leading-none">status</p>
		</div>
	);
};

const WeblnStatus = () => {
	const isWeblnConnected = useAppSelector(state => state.connection.isWeblnConnected);
	const [, updateState] = React.useState(true);
	const forceUpdate = React.useCallback(() => updateState(v => !v), []);
	const ticker = useSafeInterval(5000);
	React.useEffect(() => {
		const cbIndex = ticker.subscribe(() => {
			forceUpdate();
		});
		return () => {
			ticker.unsubscribe(cbIndex);
		};
	}, []);

	const [status, setStatus] = React.useState('bg-red-500');
	React.useEffect(() => {
		if (isWeblnConnected) setStatus('bg-green-500');
		else setStatus('bg-red-500');
	}, [isWeblnConnected]);

	return (
		<div className="h-full flex items-center">
			<div className={cn('h-2 w-2 rounded-full mr-1', status)} />
			<p className="text-xs leading-none">Webln</p>
		</div>
	);
};

const UmbrelStatus = () => {
	const isUmbrelAvailable = useAppSelector(
		state => state.connection.isUmbrelConnected && state.connection.isUmbrelAuthenticated
	);
	console.log(isUmbrelAvailable);
	return (
		<div className="h-full flex items-center">
			<div className={cn('h-2 w-2 rounded-full mr-1', isUmbrelAvailable ? 'bg-green-500' : 'bg-red-500')} />
			<p className="text-xs leading-none text-gray-800">Umbrel</p>
		</div>
	);
};
