import axios from "axios";
import { RootState } from "../../app/Store";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {  IApplication, JobcardProps } from "../../utils/types";
import React, { useEffect, useRef, useState } from "react";
import { FaLocationDot } from "react-icons/fa6";
import "./jdstyles.css";
import { HiCash } from "react-icons/hi";
import { BsClock } from "react-icons/bs";
import { CgOrganisation } from "react-icons/cg";
const JobDescription = () => {
  const { job_id } = useParams();

  const jobs = useSelector((state: RootState) => state.jobs.jobs);
  const user_id = useSelector((state: RootState) => state.auth.id);

  // console.log(jobs);
  // if (!jobs || jobs.length == 0) {
  //   return <div>Loading...</div>;
  // }
  const currentJob: JobcardProps | undefined = jobs.find(
    (job) => job._id === job_id
  );
  // console.log(currentJob);

  const [resume, setresume] = useState<File | null>(null);
  const [coverletter, setcoverletter] = useState<File | null>(null);
  const [ShowError, SetShowError] = useState("");
  const [status, setstatus] = useState<
    "Pending" | "Accepted" | "Rejected" | null
  >(null);
  const repeatError = useRef<HTMLDivElement>(null);
  const [message, setmessage] = useState("");
  const token = localStorage.getItem("token");

  const getStatus = async () => {
    let response = await axios.post(
      "http://127.0.0.1:5000/api/application/getApplicant",
      {
        user_id,
        job_id,
      }
    );
    console.log(response.data.application);

    if (response.data.success == true) {
      const application: IApplication = response.data?.application;
      setstatus(application.status);
    }
  };
  const handleApply = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formdata = new FormData();

    if (resume) formdata.append("resume", resume);
    if (coverletter) formdata.append("coverletter", coverletter);

    try {
      if (!token) throw new Error("Login first to Apply !");
      if (!resume) throw new Error("Resume Required !");

      let response = await axios.post(
        `http://127.0.0.1:5000/api/application/${job_id}/apply`,
        formdata,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setmessage(response?.data.message);
      console.log(response?.data.message, response?.data.application);
      setresume(null);
      setcoverletter(null);
      getStatus();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(error.response?.data.message);
        SetShowError(error.response?.data.message);
        setresume(null);
        setcoverletter(null);
      } else if (error instanceof Error) {
        console.log("error occured:", error);
        if (!ShowError) {
          SetShowError(error.message);
        } else {
          if (repeatError.current) {
            repeatError.current.classList.add("flash");
            setTimeout(() => {
              repeatError.current?.classList.remove("flash");
            }, 500);
          }
        }
        setresume(null);
        setcoverletter(null);
      } else {
        console.log("error occured:", error);
        setresume(null);
        setcoverletter(null);
        SetShowError("Error occured");
      }
    }
  };

  useEffect(() => {

    getStatus();
  }, []);

  return (
    <div className="flex-grow min-w-full flex flex-row  min-h-full">
      <div className={status == null ? `w-[70%]` : `w-[100vw]`}>
        {currentJob && (
          <div className="flex flex-col m-2 gap-3 rounded-2xl p-2">
            <div className="flex flex-col gap-2">
              <div className="text-2xl font-semibold ">
                {currentJob.title}
                {
                  status=="Accepted" && <span className="ml-28 text-sm  text-emerald-600 bg-emerald-50 rounded-sm p-2">{status}</span>
                }
                {
                  status=="Rejected" && <span className="ml-28 text-sm  text-red-500 bg-red-100 rounded-sm p-2">{status}</span>
                }
                {
                  status=="Pending" && <span className="ml-28 text-sm  text-blue-500 bg-blue-100 rounded-sm p-2">{status}</span>
                }
                
              </div>
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
              <p>
                {currentJob.description
                  ? currentJob.description
                  : "No description available"}
              </p>
            </div>
          </div>
        )}
      </div>
      {status == null && (
        <div className="relative z-10 w-[30%] flex justify-center items-center p-14 border-l border-l-gray-200 ">
          {!token && (
            <div className="absolute m-auto z-20 text-white font-light tracking-wide text-xl">
              Register/Login to Apply !
            </div>
          )}
          <form
            // action=""
            onSubmit={handleApply}
            className={`relative z-10 flex flex-col justify-center min-h-full items-center w-full gap-4 ${
              token == null
                ? "before:content-[''] before: absolute before:top-0 before:left-0 before:w-full before:h-full blur-[4px] rounded-sm before:z-20 before:pointer-events-auto pointer-events-none"
                : ""
            }`}
          >
            <input
              type="file"
              name="resume"
              id="resume"
              className="hidden"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setresume(e.target.files?.[0] || null);
                SetShowError("");
              }}
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setcoverletter(e.target.files?.[0] || null);
                SetShowError("");
              }}
            />
            <label
              htmlFor="coverletter"
              className="cursor-pointer bg-black text-white px-4 py-2 w-full rounded-md hover:bg-gray-600  transition-colors self-start"
            >
              {coverletter ? coverletter.name : "Upload Coverletter"}
            </label>
            {ShowError ? (
              <div
                ref={repeatError}
                className="text-red-500 text-sm self-start px-2"
              >
                {ShowError}
              </div>
            ) : (
              ""
            )}
            <button
              type="submit"
              className="bg-gray-600 text-white font-semibold font-stretch-expanded cursor-pointer px-4 py-2 w-full rounded-lg mt-8 hover:bg-gray-900 transition-colors"
            >
              Apply
            </button>
            {message ? <div>{message}</div> : null}
          </form>
        </div>
      )}
    </div>
  );
};

export default JobDescription;
