import axios from "axios";
import { RootState } from "../../app/Store";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { JobcardProps } from "../../utils/types";
import React, { useState } from "react";
import { FaLocationDot } from "react-icons/fa6";
import "./jdstyles.css";
import { HiCash } from "react-icons/hi";
import { BsClock } from "react-icons/bs";
import { CgOrganisation } from "react-icons/cg";
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
  const [error, seterror] = useState("");
  const [message, setmessage] = useState("");

  const handleApply = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formdata = new FormData();
    const token = localStorage.getItem("token");
    if (resume) formdata.append("resume", resume);
    if (coverletter) formdata.append("coverletter", coverletter);
    
    try {
      
      let response = await axios.post(
        `http://127.0.0.1:5000/api/application/${job_id?.split(":")[1]}/apply`,
        formdata,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setmessage(response?.data.message)
      console.log(response?.data.message, response?.data.application);
      setresume(null);
      setcoverletter(null);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(error.response?.data.message);
        seterror(error.response?.data.message);
        setresume(null);
        setcoverletter(null);
      } else {
        console.log("error occured:", error);
        setresume(null);
        setcoverletter(null);
        // seterror(error.response?.data.message)
      }
    }
  };
  return (
    <div className="w-full h-full flex flex-row m-1 ">
      <div className="w-[70%]">
        {currentJob && (
          <div className="flex flex-col m-2 gap-3 bg-blue-50 rounded-2xl p-2">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-semibold">{currentJob.title}</h1>
              <p className="jobinfo self-start text-orange-500">
                <span>
                  <CgOrganisation />
                </span>
                {currentJob.company}
              </p>
            </div>
            <div className="bg-blue-100 p-2 rounded-lg mb-4">
              <div className="flex flex-col">
                <div className="flex flex-row gap-10">
                  <p className="jobinfo">
                    <span>
                      <FaLocationDot />
                    </span>
                    {currentJob.location}
                  </p>
                  <p className="jobinfo">
                    <span>
                      <HiCash />
                    </span>
                    {currentJob.salary} lpa
                  </p>
                  <p>
                    <span>jobtype:</span>
                    {currentJob.jobtype}
                  </p>
                  <p>job id: {currentJob._id}</p>
                </div>
              </div>
              <div className="flex flex-row gap-10">
                <p className="jobinfo self-start">
                  <span>
                    <BsClock />
                  </span>
                  {currentJob.createdAt
                    ? new Date(currentJob.createdAt).toLocaleString()
                    : "N/A"}
                </p>
                <p>
                  <span>posted by:</span>
                  {currentJob.postedBy.name}
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xl mb-4">Desription</h2>
              <p>{currentJob.description && currentJob.description}</p>
            </div>
          </div>
        )}
      </div>
      <div className=" w-[30%] flex justify-center p-14">
        <form
          action=""
          onSubmit={handleApply}
          className="flex flex-col justify-center items-center w-full gap-4"
        >
          <input
            type="file"
            name="resume"
            id="resume"
            required
            className="hidden"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setresume(e.target.files?.[0] || null)
            }
          />
          <label
            htmlFor="resume"
            className="cursor-pointer bg-blue-400 text-white px-4 py-2 w-full rounded-md hover:bg-blue-500 transition-colors self-start"
          >
            {resume ? resume.name : "Upload Resume"}
          </label>
          <input
            type="file"
            name="coverletter"
            id="coverletter"
            className="hidden"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setcoverletter(e.target.files?.[0] || null)
            }
          />
          <label
            htmlFor="coverletter"
            className="cursor-pointer bg-blue-400 text-white px-4 py-2 w-full rounded-md hover:bg-blue-500 transition-colors self-start"
          >
            {coverletter ? coverletter.name : "Upload Coverletter"}
          </label>
          {error ? (
            <div className="text-red-500 text-sm self-start px-2">{error}</div>
          ) : (
            ""
          )}
          <button
            type="submit"
            className="bg-gray-600 text-white font-semibold font-stretch-expanded cursor-pointer px-4 py-2 w-full rounded-lg mt-8 hover:bg-gray-900 transition-colors"
          >
            Apply
          </button>
          {
            message?<div>
              {message}
            </div>:""
          }
        </form>
      </div>
    </div>
  );
};

export default JobDescription;
