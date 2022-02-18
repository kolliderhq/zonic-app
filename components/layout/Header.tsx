import React from 'react';

import cn from 'clsx';
import Img from 'next/image';

import { auth } from 'classes/Auth';
import { DIALOGS, USER_TYPE } from 'consts';
import { TABS } from 'consts';
import { setDialog } from 'contexts/modules/layout';
import { setTab } from 'contexts/modules/layout';
import { useAppDispatch, useAppSelector } from 'hooks';
import { weblnConnectAttempt } from 'hooks/init/useWebln';
import { FaCog } from "react-icons/fa";

export const Header = () => {
	const dispatch = useAppDispatch();
	const [currentDialog, loggedIn] = useAppSelector(state => [
		state.layout.dialog,
		state.user.data.token !== '' && state.user.data.type === USER_TYPE.PRO,
	]);

	return (
		<div className="flex items-center justify-between w-full h-14 pb text-gray-800">
			<figure className="w-full flex items-center justify-start relative">
				<h1 className="text-2xl">Zonic</h1>
				{/* <img className="w-30 h-[30px] xs:w-30 xs:h-8" src="/assets/logos/kollider_logo_white.png" /> */}
			</figure>
			<div className="col-span-2 w-full flex items-center justify-end gap-3 xxs:gap-4">
				<div className="flex h-full border-r border-gray-800">
					<button
						className="m-auto mr-3 transition ease-in-out hover:-translate-y-1 hover:scale-110"
						onClick={() => {
							dispatch(setTab(TABS.INFO));
						}}>
						What is Zonic?
					</button>
				</div>
				<button
					onClick={() => dispatch(setTab(TABS.SETTINGS))}
					className={cn(
						{ 'rotate-90 s-filter-theme-main': currentDialog === DIALOGS.SETTINGS },
						'min-w-[28px] mr-1 py-2 flex items-center justify-center hover:rotate-90 s-transition-rotate s-filter-theme-main-hover hover:opacity-80'
					)}>
						<FaCog className="text-xl"/>
				</button>
			</div>
		</div>
	);
};