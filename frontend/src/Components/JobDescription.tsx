import { RootState } from "../app/Store";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

const JobDescription = () => {
  const { job_id } = useParams();

  const jobs = useSelector((state: RootState) => state.jobs.jobs);
  // console.log(jobs);
  if (!jobs || jobs.length == 0) {
    return <div>Loading...</div>;
  }
  const currentJob = jobs.find((job) => job._id === job_id?.split(":")[1]);
  return (
    <div>{currentJob ? <h1>{currentJob.title}</h1> : <p>Job not found</p>}</div>
  );
};

export default JobDescription;
