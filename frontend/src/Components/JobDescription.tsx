import axios from "axios";
import { RootState } from "../app/Store";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { JobcardProps } from "../utils/types";
import React, { useState } from "react";

const JobDescription = () => {
  const { job_id } = useParams();
  
  const jobs = useSelector((state: RootState) => state.jobs.jobs);
  // console.log(jobs);
  // if (!jobs || jobs.length == 0) {
  //   return <div>Loading...</div>;
  // }
  const currentJob: JobcardProps | undefined = jobs.find(
    (job) => job._id === job_id?.split(":")[1]
  );
  // console.log(currentJob);

  const [resume, setresume] = useState<File | null>(null);
  const [coverletter, setcoverletter] = useState<File | null>(null);

  const handleApply = async (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formdata = new FormData();
    const token = localStorage.getItem("token");
    if(resume) formdata.append("resume",resume);
    if(coverletter) formdata.append("coverletter",coverletter);

    try {
      let response = await axios.post(`http://127.0.0.1:5000/api/application/${job_id?.split(":")[1]}/apply`,
          formdata,{
            headers:{
              "Content-Type":"multipart/form-data",
              Authorization:`Bearer ${token}`
            }
          });
      console.log(response?.data.message,response?.data.application)
    } catch (error) {
      if(axios.isAxiosError(error)){
        console.log(error.response?.data.message)
      }else{
        console.log("error occured:",error);
      }
    }
  };
  return (
    <div className="w-full h-full flex flex-row m-1">
      <div className="w-[60%]">
        {currentJob ? <h1>{currentJob.title}</h1> : <p>Job not found</p>}
      </div>
      <div className="w-[40%] ">
        <form action="" onSubmit={handleApply}>
          <input
            type="file"
            name="resume"
            required
            className="border outline-none cursor-pointer"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setresume(e.target.files?.[0] || null)
            }
          />
          <input
            type="file"
            name="coverletter"
            className="border outline-none cursor-pointer"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setcoverletter(e.target.files?.[0] || null)
            }
          />
          <button
          type="submit"
          className="bg-blue-200 cursor-pointer"
          >Apply
          </button>
        </form>
      </div>
    </div>
  );
};

export default JobDescription;
