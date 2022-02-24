import React, { useEffect, useState } from 'react';

import { BalanceInfo } from 'components/BalanceInfo';
import { ConvertFunds } from 'components/ConvertFunds';
import { Dialogs } from 'components/dialogs/DIalogs';
import { Popups } from 'components/dialogs/Popups';
import { SymbolSelectDropdown } from 'components/Dropdown';
import { IndexPriceSparkLine } from 'components/graphs/IndexPriceSparkLine';
import { Header } from 'components/layout/Header';
import { Leaderboard } from 'components/Leaderboard';
import Loader from 'components/Loader';
import { MainPriceGauge } from 'components/MainPriceGauge';
import { OrderArea } from 'components/OrderArea';
import { Overview } from 'components/Overview';
import { PositionOverview } from 'components/positions/Positions';
import { TradingViewTables } from 'components/positions/PositionsTable';
import { ReceivePayment } from 'components/ReceivePayment';
import { SendPayment } from 'components/SendPayment';
import { TransactionProcessingInfo } from 'components/TransactionProcessInfo';
import { SymbolsLoadedWrapper } from 'components/wrappers/SymbolsLoadedWrapper';
import { TABS } from 'consts';
import { useAppSelector } from 'hooks';

import { UmbrelAuth } from '../components/UmbrelAuth';
import { UserInfo } from '../components/UserInfo';
import {Info } from '../components/Info';
import {Settings} from '../components/Settings';

export default function Home() {
	const [selectedTab, paymentInTransit, isUmbrelAuthenticated] = useAppSelector(state => [
		state.layout.selectedTab,
		state.payments.paymentInTransit,
		state.connection.isUmbrelAuthenticated,
	]);
	return (
		// bg-gradient-to-br from-indigo-500 to-indigo-800
		<div className="w-full sm:grid sm:grid-rows sm:px-4 pt-3 relative bg-white">
			<Dialogs />
			<Header />
			<div className="h-screen">
				<div className="flex h-full">
					<div className="bg-white font-semibold mx-auto text-center rounded-3xl border px-4 py-8 h-128 w-128 shadow-2xl shadow-indigo-500/50">
						{!isUmbrelAuthenticated ? (
							<UmbrelAuth />
						) : (
							<div className="h-full">
								{selectedTab === TABS.OVERVIEW && <Overview />}
								{selectedTab === TABS.RECEIVE && <ReceivePayment />}
								{selectedTab === TABS.SEND && <SendPayment />}
								{selectedTab === TABS.CONVERT && <ConvertFunds/>}
								{selectedTab === TABS.INFO && <Info/>}
								{selectedTab === TABS.SETTINGS && <Settings/>}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
