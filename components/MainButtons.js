import { RiDownloadLine, RiExchangeLine, RiSendPlane2Line } from 'react-icons/ri';

import { TABS } from 'consts';
import { setTab } from 'contexts/modules/layout';
import { useAppDispatch } from 'hooks';

export const MainButtons = () => {
	let dispatch = useAppDispatch();
	return (
		<div className="flex justify-center mt-4">
			<div>
				<button
					className="mx-2 bg-indigo-600 px-4 py-2 rounded-3xl text-gray-100 font-semibold uppercase tracking-wide"
					onClick={() => dispatch(setTab(TABS.CONVERT))}>
					<div className="flex">
						Convert <RiExchangeLine className="text-xl ml-2 m-auto" />
					</div>
				</button>
			</div>
			<div className="">
				<button className="mx-2 bg-indigo-600 px-4 py-2 rounded-3xl text-gray-100 font-semibold uppercase tracking-wide"
					onClick={() => dispatch(setTab(TABS.SEND))}>
					<div className="flex">
						Send <RiSendPlane2Line className="text-xl ml-2 m-auto" />
					</div>
				</button>
			</div>
			<div>
				<button className="mx-2 bg-indigo-600 px-4 py-2 rounded-3xl text-gray-100 font-semibold uppercase tracking-wide"
					onClick={() => dispatch(setTab(TABS.RECEIVE))}>
					<div className="flex">
						Receive <RiDownloadLine className="text-xl ml-2 m-auto" />
					</div>
				</button>
			</div>
		</div>
	);
};
