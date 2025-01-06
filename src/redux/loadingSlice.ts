import { createSlice, PayloadAction, configureStore } from '@reduxjs/toolkit';
import { ThunkAction } from 'redux-thunk';
import { RootState } from './store';

interface LoadingState {
    loading: boolean;
    minimalLoadingWithText: false | string;
}

// Initial State
const initialState: LoadingState = {
    loading: false,
    minimalLoadingWithText: false
};

const loadingSlice = createSlice({
    name: 'loading',
    initialState,
    reducers: {
        setLoading(state, action: PayloadAction<boolean>) {
            state.loading = action.payload;
        },
        setMinimalLoadingWithText(state, action: PayloadAction<false | string>) {
            state.minimalLoadingWithText = action.payload;
        }
    },
});

export const { setLoading, setMinimalLoadingWithText } = loadingSlice.actions;

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
