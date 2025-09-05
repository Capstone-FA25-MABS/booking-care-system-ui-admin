// This file is deprecated. Redux configuration has been moved to src/store/
// Please use the new Redux setup from src/store/index.ts

export { store, persistor } from '../store';
export type { RootState, AppDispatch } from '../store';
export { useAppDispatch, useAppSelector } from '../store/hooks';
export { default as ReduxProvider } from '../store/ReduxProvider';
