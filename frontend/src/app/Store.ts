import { configureStore } from "@reduxjs/toolkit";
import Authreducer from "../features/Authslice";

const store = configureStore({
    reducer: {
        auth: Authreducer
    }
});

export type RootState = ReturnType<typeof store.getState>

export default store;
