import { createSlice, PayloadAction, configureStore } from '@reduxjs/toolkit';
import { ThunkAction } from 'redux-thunk';
import { RootState } from './store';

interface LoadingState {
    loading: boolean;
}

// Initial State
const initialState: LoadingState = {
    loading: false,
};

const loadingSlice = createSlice({
    name: 'loading',
    initialState,
    reducers: {
        setLoading(state, action: PayloadAction<boolean>) {
            state.loading = action.payload;
        },
    },
});

export const { setLoading } = loadingSlice.actions;

// Thunk for delayed false loading
export const setLoadingWithDelay = (
    isLoading: boolean,
    delay: number = 0
): ThunkAction<void, RootState, unknown, PayloadAction<boolean>> => {
    return (dispatch) => {
        if (!isLoading && delay > 0) {
            setTimeout(() => {
                dispatch(setLoading(isLoading));
            }, delay * 1000);
        } else {
            dispatch(setLoading(isLoading));
        }
    };
};

export default loadingSlice.reducer;
