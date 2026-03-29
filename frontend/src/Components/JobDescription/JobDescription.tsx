import axios from "axios";
import { RootState } from "../../app/Store";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { IApplication, JobcardProps } from "../../utils/types";
import React, { useEffect, useRef, useState } from "react";
import "./jdstyles.css";
import { HiCash } from "react-icons/hi";
import { BsClock } from "react-icons/bs";
import { CgOrganisation } from "react-icons/cg";
import { DetailCard } from "../DetailCard";
const JobDescription = () => {
  const { job_id } = useParams();

  const jobs = useSelector((state: RootState) => state.jobs.jobs);
  const user_id = useSelector((state: RootState) => state.auth.id);

  // console.log(jobs);
  // if (!jobs || jobs.length == 0) {
  //   return <div>Loading...</div>;
  // }
  const currentJob: JobcardProps = jobs.find(
    (job) => job._id === job_id
  ) as JobcardProps;

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
      // console.log(response.data.application);
  
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
    <div className="relative w-full p-2">
      <div className="relative max-w-8/12 p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center gap-6 mb-8">
        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
          {currentJob?.companyLogo ? (
            <img
              src={currentJob.companyLogo}
              alt={currentJob.company}
              className="w-full h-full object-contain rounded-lg"
            />
          ) : (
            <CgOrganisation className="w-8 h-8 text-gray-400" />
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {currentJob?.title}
          </h1>
          <p className="text-lg text-gray-600">{currentJob?.company}</p>
        </div>
        <div className="ml-auto flex items-center gap-2 border border-gray-50 p-1">
            <h4 className="text-sm"> Status :</h4>
            <span
              className={` p-1 rounded-sm ${
                status == "Pending"
                  ? "text-blue-500 bg-blue-50"
                  : status == "Accepted"
                  ? "text-green-600 bg-green-50"
                  : status == "Rejected"
                  ? "text-red-500 bg-red-50"
                  : "text-gray-500 bg-gray-50"
              }`}
            >
              {status || "Not Applied"}
            </span>
        </div>
      </div>

      {/* Key Details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <DetailCard
          icon={<HiCash />}
          label="Salary"
          value={currentJob?.salary}
        />
        {
          currentJob?.experience && <DetailCard icon={<BsClock />} label="Experience" value={currentJob.experience} />
        }
        
        <DetailCard
          icon={<CgOrganisation />}
          label="Job Type"
          value={currentJob?.jobtype}
        />
      </div>

      {/* Job Description */}
      <div className="max-h-96">
        <h2 className="text-xl mb-4">Desription</h2>
        <p className="bg-gray-100 p-1 rounded-md">
          {currentJob?.description
            ? currentJob.description
            : "No description available"}
        </p>
      </div>

      </div>

      {/* Application Form */}
      {status == null && (
        <div className="absolute top-0 right-0 w-[30%] flex justify-center items-center p-14">
          {!token && (
            <div className="absolute m-auto z-30 text-white tracking-wider text-2xl">
              Register/Login to Apply !
            </div>
          )}
          <form
            // action=""
            onSubmit={handleApply}
            className={`relative z-10 flex flex-col justify-center min-h-full items-center w-full gap-4 ${
              token == null
                ? "before:content-[''] before: absolute before:top-0 before:left-0 before:w-full before:h-full blur-[8px] rounded-sm before:z-20 before:pointer-events-auto pointer-events-none"
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
