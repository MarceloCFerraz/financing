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
import simulationsReducer from './slices/simulationsSlice';

const persistConfig = {
  key: 'financing-calculator',
  version: 3,
  storage,
  whitelist: ['simulations'],
  migrate: (state: any) => {
    // Migration from version 1 to 2: Add global currency field
    if (state && state.simulations && !state.simulations.currency) {
      state = {
        ...state,
        simulations: {
          ...state.simulations,
          currency: 'BRL',
        },
      };
    }

    // Migration from version 2 to 3: Add payFaster fields to existing simulations
    if (state && state.simulations && state.simulations.simulations) {
      state.simulations.simulations = state.simulations.simulations.map((sim: any) => ({
        ...sim,
        payFasterEnabled: sim.payFasterEnabled ?? false,
        maxMonthlyPayment: sim.maxMonthlyPayment ?? 0,
      }));
    }

    return Promise.resolve(state);
  },
};

const rootReducer = combineReducers({
  simulations: simulationsReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const makeStore = () => {
  return configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

// For persistor, we need to create the store first
let store: AppStore | null = null;

export const getStore = () => {
  if (!store) {
    store = makeStore();
  }
  return store;
};

export const getPersistor = () => persistStore(getStore());
