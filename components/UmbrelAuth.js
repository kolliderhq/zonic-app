import React, { useEffect, useMemo, useState } from 'react';
import { BsFillShieldLockFill } from 'react-icons/bs';
import { IoClose } from 'react-icons/io5';

import cn from 'clsx';
import toNumber from 'lodash-es/toNumber';
import Img from 'next/image';

import { baseUmbrelSocketClient } from 'classes/UmbrelSocketClient';
import { useAppDispatch, useAppSelector, useSymbolData, useSymbols } from 'hooks';
import { useMarkPrice } from 'hooks/useMarkPrice';
import { applyDp, roundDecimal } from 'utils/format';
import { displayToast } from 'utils/toast';
import { TOAST_LEVEL } from 'utils/toast';
import { setIsUmbrelAuthenticated } from 'contexts';

export const UmbrelAuth = ({ }) => {
	const dispatch = useAppDispatch();
	const [password, setPassword] = useState('');

	const socketState = React.useRef({ fetching: false });

	const onConfirm = React.useCallback(() => {
		if (socketState.current.fetching === true) return;
		socketState.current.fetching = true;
		baseUmbrelSocketClient.socketSend('AUTHENTICATION', { password }, data => {
			socketState.current.fetching = false;
			if (data?.data?.status === 'success') {
				socketState.current.fetching = false;
				displayToast('Umbrel Auth Successful', {
					type: 'success',
					level: TOAST_LEVEL.INFO,
				});
				dispatch(setIsUmbrelAuthenticated(true));
			} else {
				// data.data.msg === 'Wrong password' or something like that probably changed by the time you read this
				displayToast('Wrong Password - try again', {
					type: 'error',
					level: TOAST_LEVEL.VERBOSE,
				});
			}
		});
	}, [password]);

	const onEnter = React.useCallback(
		e => {
			if (e.key === 'Enter') onConfirm();
		},
		[onConfirm]
	);


	return (
		<div className="flex flex-col w-full h-full text-gray-600">
			<div className="m-auto">
				<div className="w-full flex justify-center text-center text-4xl">
					<BsFillShieldLockFill />
				</div>
				<div className="flex flex-col items-center">
					<div className="mx-auto max-w-xxxs w-full px-4py-4">
						<p className="text-lg text-center py-5">Umbrel Auth</p>
						<div className="h-10 border border-2 rounded-md w-full relative">
							<input
								onKeyDown={onEnter}
								value={password}
								onInput={e => setPassword(e.target.value)}
								placeholder="password"
								type="password"
								style={{ textAlign: 'center' }}
								className="input-default inline-block w-full border rounded-md border-transparent"
							/>
						</div>
					</div>
				</div>
			</div>

			<div className="w-full flex items-center justify-center mt-6">
				<button
					onClick={onConfirm}
					className="border-gray-600 border-2 hover:opacity-80 cursor-pointer border rounded-lg w-1/2 px-5 py-2">
					<p>Confirm</p>
				</button>
			</div>
		</div>
	);
};
