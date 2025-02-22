import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { JobcardProps } from "../utils/types";

interface jobstate{
    jobs:JobcardProps[];
}
const initialState:jobstate = {
    jobs:[]
};

export const Jobslice =createSlice({
    name:"job",
    initialState,
    reducers:{
        setJobs(state,action:PayloadAction<JobcardProps[]>){
            state.jobs = action.payload
        }
    }
})

export const {setJobs}= Jobslice.actions
export default Jobslice.reducer;
