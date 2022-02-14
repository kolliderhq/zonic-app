import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { DIALOGS, POPUPS, TABS, TABLE_TABS, SELECTED_WALLET } from 'consts';

interface InitLayout {
	dialog: DIALOGS;
	popup: POPUPS;
	selectedTab: TABS;
	selectedTableTab: TABLE_TABS,
	selectedWallet: string,
	editingLeverage: boolean;
}

const initialState: InitLayout = {
	dialog: DIALOGS.NONE,
	popup: POPUPS.NONE,
	selectedTab: TABS.OVERVIEW,
	selectedTableTab: TABLE_TABS.POSITIONS,
	selectedWallet: "BTC",
	editingLeverage: false,
};

export const layoutSlice = createSlice({
	name: 'layout',
	initialState,
	reducers: {
		setDialog: (state, action: PayloadAction<DIALOGS>) => {
			state.dialog = action.payload;
		},
		setDialogClose: state => {
			state.dialog = DIALOGS.NONE;
		},

		setPopup: (state, action: PayloadAction<POPUPS>) => {
			state.popup = action.payload;
		},
		setPopupClose: state => {
			state.popup = POPUPS.NONE;
		},

		setTab: (state, action: PayloadAction<TABS>) => {
			state.selectedTab = action.payload;
		},

		setTableTab: (state, action: PayloadAction<TABLE_TABS>) => {
			state.selectedTableTab = action.payload
		},

		setEditLeverage: (state, action: PayloadAction<boolean>) => {
			state.editingLeverage = action.payload;
		},
		setSelectedWallet: (state, action: PayloadAction<string>)  => {
			state.selectedWallet = action.payload;
		}
	},
});

export const { setDialog, setDialogClose, setPopup, setTab, setPopupClose, setEditLeverage, setTableTab, setSelectedWallet } = layoutSlice.actions;

export default layoutSlice.reducer;
