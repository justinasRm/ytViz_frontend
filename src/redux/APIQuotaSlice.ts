import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface QuotaState {
    quota: number;
}

const initialState: QuotaState = {
    quota: 0,
};

const quotaSlice = createSlice({
    name: 'APIQuota',
    initialState,
    reducers: {
        updateAPIQuota(state, action: PayloadAction<number>) {
            state.quota = action.payload
        },
    },
});

export const { updateAPIQuota } = quotaSlice.actions;

export default quotaSlice.reducer;
