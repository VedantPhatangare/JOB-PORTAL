import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../app/Store";
import { useSearchParams } from "react-router-dom";
import { JobcardProps } from "../utils/types";

const RecruiterHome = () => {

  const [searchParams] = useSearchParams()
  const [newJobs, setnewJobs] = useState<JobcardProps[]>([])
  const jobs = useSelector((state: RootState) => state.jobs.jobs);
  const id= searchParams.get('id') as string
  const getPostedjobs = () => {
    let newjobs=jobs.filter((job) => job.postedBy.id == id);
    setnewJobs(newjobs);
  };
  useEffect(() => {
    getPostedjobs();
  }, [jobs,id]);

  return <div>
    {
      (newJobs.length != 0 && newJobs)?
        newJobs.map((job)=>
          <div>{job._id}</div>
        )
      : "No Job Post from You"
    }
    </div>;
};

export default RecruiterHome;
