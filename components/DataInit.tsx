import React from 'react';

import empty from 'is-empty';
import { useRouter } from 'next/router';

import { WrapHasLightClient } from 'components/wrappers/LightClientWrapper';
import useAutoLogout from 'hooks/init/useAutoLogout';
import { useCheckIpLocation } from 'hooks/init/useCheckIpLocation';
import useGetMiscData from 'hooks/init/useGetMiscData';
import { useGetOrderbookData } from 'hooks/init/useGetOrderbookData';
import { useInitialize } from 'hooks/init/useInitialize';
import { useProFixes } from 'hooks/init/useProFixes';
import useQuerySideEffects from 'hooks/init/useQuerySideEffects';
import { useSocketData } from 'hooks/init/useSocketData';
import { useUmbrel } from 'hooks/init/useUmbrel';
import { useWebln } from 'hooks/init/useWebln';
import { useAppSelector } from 'hooks/redux';
import { useStatusChecker } from 'hooks/useStatusChecker';
import { auth } from 'classes/Auth';

export const DataInit = () => {
	const [loaded, setLoaded] = React.useState(false);
	React.useEffect(() => {
		setLoaded(true);
	}, []);

	useGetMiscData();
	useStatusChecker();

	const afterhydration = React.useMemo(() => {
		if (!loaded) return;
		return <RunOnHydration />;
	}, [loaded]);

	const history = useRouter();
	const afterHistoryLoad = React.useMemo(() => {
		if (!history.isReady) return;
		return <RunOnHistoryLoad />;
	}, [history.isReady]);

	const symbolData = useAppSelector(state => state.symbols.symbolData);
	const afterSymbolLoad = React.useMemo(() => {
		if (empty(symbolData)) return;
		return <RunOnSymbolLoad />;
	}, [symbolData]);

	return (
		<>
			{afterhydration}
			{afterHistoryLoad}
			{afterSymbolLoad}
		</>
	);
};

const RunOnHydration = () => {
	useQuerySideEffects(); //  parse url queries
	useSocketData();
	useProFixes();
	useCheckIpLocation();
	return <></>;
};

const RunOnHistoryLoad = () => {
	useInitialize(); //	authenticate user -> done before loading screen

	return <></>;
};

const RunOnSymbolLoad = () => {
	useAutoLogout();
	useGetOrderbookData(); //	init socket data
	return <>{process.env.NEXT_PUBLIC_UMBREL === '1' ? <Umbrel /> : <Webln />}</>;
};

const Webln = () => {
	useWebln();
	return <></>;
};
const Umbrel = () => {
	useUmbrel();
	React.useEffect(() => {
		if (process.env.NEXT_PUBLIC_UMBREL === '1' && window.location.hostname !== 'umbrel.local') {
			alert('Zonic only supports being loaded from umbrel.local:4243');
		}
		auth.logoutUser()
	}, []);
	return (
		<WrapHasLightClient loaderElement={<></>}>
			<></>
		</WrapHasLightClient>
	);
};
