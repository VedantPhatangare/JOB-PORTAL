import { configureStore } from "@reduxjs/toolkit";
import Authreducer from "../features/Authslice";
import JobReducer from '../features/Jobslice'
const store = configureStore({
    reducer: {
        auth: Authreducer,
        jobs: JobReducer
    }
});

export type RootState = ReturnType<typeof store.getState>
export type Appdispatch = typeof store.dispatch

export default store;
