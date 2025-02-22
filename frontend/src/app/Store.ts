import { combineReducers, configureStore } from "@reduxjs/toolkit";
import Authreducer from "../features/Authslice";
import JobReducer from '../features/Jobslice'
import { persistReducer, persistStore } from "redux-persist";
import storage from 'redux-persist/lib/storage'
const persistConfig = {
    key:'root',
    storage,
}
const myReducers =combineReducers({
    auth: Authreducer,
    jobs: JobReducer
}) 
const persistedReducers = persistReducer(persistConfig,myReducers)

const store = configureStore({
    reducer: persistedReducers
});

export const persistor = persistStore(store)
export type RootState = ReturnType<typeof store.getState>
export type Appdispatch = typeof store.dispatch

export default store;
