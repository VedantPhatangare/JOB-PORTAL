import { lazy, Suspense, useEffect, useState } from "react";
const Jobcard = lazy(() => import("../Components/JobCard/Jobcard"));
import { JobcardProps } from "../utils/types";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setJobs } from "../features/Jobslice";
import { Appdispatch } from "../app/Store";
import HomeLoader from "../Components/HomeLoader";

const Home: React.FC = () => {
  const dispatch = useDispatch<Appdispatch>();
  const [jobs, setjobs] = useState<JobcardProps[]>([]);
  const getJobs = async () => {
    const response = await axios.get("http://127.0.0.1:5000/api/jobs/getjobs");
    // console.log(response);
    setjobs(response.data.jobs);
    dispatch(setJobs(response.data.jobs));
  };
  useEffect(() => {
    getJobs();
  }, []);

  return (
    <div className="relative w-full h-full flex justify-center items-center bg-gray-100">
      <div className="w-[30%] h-full "></div>
      <div className=" w-[40%] h-full p-4 flex flex-col">
        {jobs.length != 0 && jobs ? (
          jobs.map((job: JobcardProps) => (
            <Suspense fallback={<HomeLoader />}>
              <Jobcard key={job._id} {...job} />
            </Suspense>
          ))
        ) : (
          <div className="bg-gray-200 h-30 w-full rounded-lg self-center flex justify-center items-center justify-self-center text-neutral-700 text-lg tracking-wide">
            No Jobs Available
          </div>
        )}
      </div>
      <div className="w-[30%] h-full "></div>
    </div>
  );
};

export default Home;
