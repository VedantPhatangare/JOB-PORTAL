import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
    isAuthenticated: boolean;
    role:"Candidate" | "Recruiter" |"",
    id:string
}

const initialState: AuthState = {
    isAuthenticated: false,
    role: "",
    id:""
}

export const AuthSlice= createSlice({
    name:"Auth",
    initialState,
    reducers:{
        login(state, action:PayloadAction<{role:"Candidate" | "Recruiter",id:string}>){
            state.isAuthenticated = true;
            state.role = action.payload.role;
            state.id = action.payload.id;
        },
        logout(state){
            state.isAuthenticated = false;
            state.id= ""
            state.role = ""
        }
    }
})

export const {login,logout} = AuthSlice.actions;
export default AuthSlice.reducer;
