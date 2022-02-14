import { MainButtons } from './MainButtons';
import { TxTable } from './TxTable';
import { WalletCard } from './WalletCard ';

export const Overview = () => {
	return (
		<div className="w-full">
			<WalletCard />
			<MainButtons />
			<div className="flex mt-4 h-auto border-2 rounded-3xl p-2">
				<TxTable />
			</div>
		</div>
	);
};
