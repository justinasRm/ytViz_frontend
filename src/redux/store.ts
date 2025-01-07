import { configureStore } from '@reduxjs/toolkit';
import loadingReducer from './loadingSlice';
import quotaReducer from './APIQuotaSlice';

const store = configureStore({
    reducer: {
        loading: loadingReducer,
        quota: quotaReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
