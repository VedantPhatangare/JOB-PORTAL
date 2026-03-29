import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  isAuthenticated: boolean;
  role: "Candidate" | "Recruiter" | "";
  id: string;
  name: string;
  email: string;
}

const initialState: AuthState = {
  isAuthenticated: false,
  role: "",
  id: "",
  name: "",
  email: "",
};

export const AuthSlice = createSlice({
  name: "Auth",
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ id: string; role: "Candidate" | "Recruiter"; name: string; email: string }>
    ) {
      state.isAuthenticated = true;
      state.id = action.payload.id;
      state.role = action.payload.role;
      state.name = action.payload.name;
      state.email = action.payload.email;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.id = "";
      state.role = "";
      state.name = "";
      state.email = "";
    },
  },
});

export const { setCredentials, logout } = AuthSlice.actions;
export default AuthSlice.reducer;
