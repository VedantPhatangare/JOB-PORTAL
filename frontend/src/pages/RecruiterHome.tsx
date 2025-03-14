import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../app/Store";
import { useSearchParams } from "react-router-dom";
import { JobcardProps, jobPostForm } from "../utils/types";
import JobpostCard from "../Components/JobPostCard/JobpostCard";
import axios from "axios";
import { IoCheckmarkDoneCircle } from "react-icons/io5";

const RecruiterHome = () => {
  const [searchParams] = useSearchParams();
  const [newJobs, setnewJobs] = useState<JobcardProps[]>([]);
  const jobs = useSelector((state: RootState) => state.jobs.jobs);
  const id = searchParams.get("id") as string;
  const getPostedjobs = () => {
    let newjobs = jobs.filter((job) => job.postedBy.id == id);
    setnewJobs(newjobs);
  };
  useEffect(() => {
    getPostedjobs();
  }, [jobs, id]);

  const [error, seterror] = useState<string | null>(null);
  const [msgSucces, setmsgSucces] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [salary, setSalary] = useState("");
  const [jobtype, setJobtype] = useState("");
  const description = useRef<HTMLTextAreaElement>(null);
  const errorDiv = useRef<HTMLDivElement>(null);
  const inputDiv = useRef<HTMLFormElement>(null);

  const handleCreatejob = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formdata = new FormData();
    const token = localStorage.getItem("token");
    const allClear: jobPostForm = {
      title: { value: title, message: "Job title is required" },
      company: { value: company, message: "Company name is required" },
      location: { value: location, message: "Location is required" },
      salary: { value: salary, message: "Salary is required" },
      jobtype: { value: jobtype, message: "Job type is required" },
      description: {
        value: description.current?.value,
        message: "Description is required",
      },
    };
    const emptyInput = Object.entries(allClear).find(
      ([_, data]) => !data.value
    );

    if (emptyInput) {
      const [name, data] = emptyInput;

      const faulty = inputDiv.current?.querySelector(`[name = "${name}"]`);
      if (faulty) {
        faulty.classList.add("flashInput");
        setTimeout(() => {
          faulty.classList.remove("flashInput");
        }, 500);
      }

      if (error) {
        errorDiv.current?.classList.add("flash");
        setTimeout(() => {
          errorDiv.current?.classList.remove("flash");
        }, 500);
      } else seterror(data.message);

      return;
    }

    Object.entries(allClear).forEach((data) => {
      formdata.append(data[0], data[1].value);
    });
    
    
    try {
      let response = await axios.post("http://127.0.0.1:5000/api/jobs/createjob", 
        formdata, 
        {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

       setmsgSucces(response.data.message);
       setTimeout(() => {
        setmsgSucces(null)
       }, 3000);
    } catch (error) {
      if(axios.isAxiosError(error)){
        seterror(error.response?.data.message)
      }else if(error instanceof Error){
        seterror(error.message)
      }
    }
  };

  return (
    <div className="min-h-[90vh] w-full flex flex-row gap-2 p-2">
      <div className="w-[70vw] p-2 bg-blue-50">
        {newJobs.length != 0 && newJobs
          ? newJobs.map((job: JobcardProps) => (
              <JobpostCard key={job._id} {...job} />
            ))
          : "No Job Post from You"}
      </div>
      <div className="w-[30vw] py-6 rounded-2xl">
        <h2 className="text-xl font-semibold text-center mb-8">
          Create New Job
        </h2>
        <form
          action=""
          onSubmit={handleCreatejob}
          ref={inputDiv}
          className="flex flex-col max-w-96 m-auto gap-4"
        >
          <input
            type="text"
            name="title"
            className="form-input"
            placeholder="Job title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              seterror(null);
            }}
          />
          <input
            type="text"
            name="company"
            className="form-input"
            placeholder="company"
            value={company}
            onChange={(e) => {
              setCompany(e.target.value);
              seterror(null);
            }}
          />
          <input
            type="text"
            name="location"
            className="form-input"
            placeholder="location"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              seterror(null);
            }}
          />
          <div className="flex flex-row gap-2">
            <input
              type="text"
              name="salary"
              className="form-input"
              placeholder="salary in lpa"
              value={salary}
              onChange={(e) => {
                setSalary(e.target.value);
                seterror(null);
              }}
            />
            <select
              name="jobType"
              id="jobType"
              className="form-input"
              value={jobtype}
              onChange={(e) => {
                setJobtype(e.target.value);
                seterror(null);
              }}
            >
              <option value="" disabled>
                Select
              </option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
          </div>
          <textarea
            name="description"
            ref={description}
            className="form-input h-44 my-2 border-gray-400"
            placeholder="Job description"
            onChange={() => seterror(null)}
          ></textarea>
          {error && (
            <div ref={errorDiv} className="text-red-400">
              {error}
            </div>
          )}
          {
            msgSucces && (
              <div className="text-blue-400">
              <IoCheckmarkDoneCircle />
              {msgSucces}
            </div>
  )
          }
          <button
            type="submit"
            className="bg-blue-400 p-2 rounded-md text-white font-medium cursor-pointer transition-all hover:bg-black"
          >
            Create
          </button>
        </form>
      </div>
    </div>
  );
};

export default RecruiterHome;
