import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
    isAuthenticated: boolean;
    role?:"Candidate" | "Recruiter" |""
}

const initialState: AuthState = {
    isAuthenticated: false,
    role: ""
}

export const AuthSlice= createSlice({
    name:"Auth",
    initialState,
    reducers:{
        login(state, action:PayloadAction<"Candidate" | "Recruiter">){
            state.isAuthenticated = true;
            state.role = action.payload;
        },
        logout(state){
            state.isAuthenticated = false;
        }
    }
})

export const {login,logout} = AuthSlice.actions;
export default AuthSlice.reducer;
