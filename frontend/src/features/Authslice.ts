import { createSlice } from "@reduxjs/toolkit";

interface AuthState {
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    isAuthenticated: false
}

export const AuthSlice= createSlice({
    name:"Auth",
    initialState,
    reducers:{
        login(state){
            state.isAuthenticated = true;
        },
        logout(state){
            state.isAuthenticated = false;
        }
    }
})

export const {login,logout} = AuthSlice.actions;
export default AuthSlice.reducer;
