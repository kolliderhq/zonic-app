import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export interface Wallet {
	balance: number;
	currencySymbol: string;
	denomination: string;
	dp: number
}

export interface Wallets {
	wallets: Record<string, Wallet>;
	availableWallets: Array<string>
}

const initialState: Wallets = {
	wallets: {},
	availableWallets: ["BTC", "USD"]
};

export const walletSlice = createSlice({
	name: 'wallets',
	initialState,
	reducers: {
		setWallets: (state, action: PayloadAction<{ wallets: Record<string, Wallet> }>) => {
			state.wallets = action.payload.wallets;
		},
		setWallet: (state, action: PayloadAction<{ currencySymbol: string; wallet: Wallet }>) => {
			state.wallets = { ...state.wallets, [action.payload.currencySymbol]: action.payload.wallet };
		},
		setWalletBalance: (state, action: PayloadAction<{ currency: string; balance: number }>) => {
			state.wallets = {
				...state.wallets,
				[action.payload.currency]: { ...state.wallets[action.payload.currency], ['balance']: action.payload.balance },
			};
		},
	},
});

export const { setWallets, setWallet, setWalletBalance } = walletSlice.actions;
export default walletSlice.reducer;
