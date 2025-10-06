import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { PersistConfig } from 'redux-persist';

// Import reducers
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import discountReducer from './slices/discount.slice';
import uiReducer from './slices/uiSlice';

// Root reducer
const rootReducer = combineReducers({
    auth: authReducer,
    user: userReducer,
    discount: discountReducer,
    ui: uiReducer,
});

// Redux persist configuration
const persistConfig: PersistConfig<RootState> = {
    key: 'booking-care-root',
    storage,
    whitelist: ['auth', 'user', 'ui'], // Only persist auth, user, and UI state
    blacklist: ['discount'], // Don't persist these (fetch fresh on app load)
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
    devTools: process.env.NODE_ENV !== 'production',
});

// Export persistor
export const persistor = persistStore(store);

// Export types
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
