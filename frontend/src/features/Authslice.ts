import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserProfile } from "../utils/types";

interface AuthState {
  isAuthenticated: boolean;
  role: "Candidate" | "Recruiter" | "";
  id: string;
  name: string;
  email: string;
  // Profile fields
  skills: string[];
  bio: string;
  profilePhoto: string;
  resumeUrl: string;
  experience: string;
  education: string;
  companyName: string;
  companyWebsite: string;
  companyDescription: string;
  companyLogo: string;
  savedJobs: string[];
}

const initialState: AuthState = {
  isAuthenticated: false,
  role: "",
  id: "",
  name: "",
  email: "",
  skills: [],
  bio: "",
  profilePhoto: "",
  resumeUrl: "",
  experience: "",
  education: "",
  companyName: "",
  companyWebsite: "",
  companyDescription: "",
  companyLogo: "",
  savedJobs: [],
};

export const AuthSlice = createSlice({
  name: "Auth",
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<UserProfile>) {
      state.isAuthenticated = true;
      state.id = action.payload.id;
      state.role = action.payload.role;
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.skills = action.payload.skills || [];
      state.bio = action.payload.bio || "";
      state.profilePhoto = action.payload.profilePhoto || "";
      state.resumeUrl = action.payload.resumeUrl || "";
      state.experience = action.payload.experience || "";
      state.education = action.payload.education || "";
      state.companyName = action.payload.companyName || "";
      state.companyWebsite = action.payload.companyWebsite || "";
      state.companyDescription = action.payload.companyDescription || "";
      state.companyLogo = action.payload.companyLogo || "";
      state.savedJobs = action.payload.savedJobs || [];
    },
    toggleBookmark(state, action: PayloadAction<string>) {
      const jobId = action.payload;
      if (state.savedJobs.includes(jobId)) {
        state.savedJobs = state.savedJobs.filter((id) => id !== jobId);
      } else {
        state.savedJobs.push(jobId);
      }
    },
    logout(_state) {
      return { ...initialState };
    },
  },
});

export const { setCredentials, logout, toggleBookmark } = AuthSlice.actions;
export default AuthSlice.reducer;
