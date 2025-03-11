import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../app/Store";
import { useSearchParams } from "react-router-dom";
import { JobcardProps } from "../utils/types";
import JobpostCard from "../Components/JobPostCard/JobpostCard";

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

  return (
    <div className="min-h-[90vh] w-full flex flex-row gap-2 p-2">
      <div className="w-[70vw] p-2 bg-blue-100">
        {newJobs.length != 0 && newJobs
          ? newJobs.map((job:JobcardProps) => <JobpostCard key={job._id} {...job}/>)
          : "No Job Post from You"}
      </div>
      <div className="w-[30vw] p-2 bg-blue-100">
        <button>Post Job</button>
      </div>
    </div>
  );
};

export default RecruiterHome;
