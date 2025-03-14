import { lazy, Suspense, useEffect, useState } from "react";
const Jobcard = lazy(() => import("../Components/JobCard/Jobcard"));
// import Jobcard from "../Components/JobCard/Jobcard"
import { JobcardProps } from "../utils/types";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setJobs } from "../features/Jobslice";
import { Appdispatch } from "../app/Store";

const Home: React.FC = () => {
  const dispatch = useDispatch<Appdispatch>();
  const [jobs, setjobs] = useState<JobcardProps[]>([]);
  const getJobs = async () => {
    const response = await axios.get("http://127.0.0.1:5000/api/jobs/getjobs");
    console.log(response);
    setjobs(response.data.jobs);
    dispatch(setJobs(response.data.jobs));
  };
  useEffect(() => {
    getJobs();
  }, []);

  return (
    <div className="relative w-full h-full flex justify-center items-center">
      <div className="w-[70%] h-full flex pt-8">
        <div className="w-[25%] h-full"></div>
        <div className="jobs w-[50%] h-full">
          {jobs
            ? jobs.map((job: JobcardProps) => (
                <Suspense
                  fallback={
                    <div className="w-full bg-gray-100 h-40 mb-2 mt-2 p-2 rounded-xl">
                      <div className="bg-gray-200 w-50 h-4 rounded-sm"></div>
                      <div className="bg-gray-200 w-20 h-4 rounded-sm mt-2"></div>
                      <div className="ml-2 mt-5">
                      <div className="bg-gray-200 w-12 h-4 rounded-sm mb-2"></div>
                      <div className="bg-gray-200 w-12 h-4 rounded-sm"></div>
                      </div>
                      <div className="ml-2 mt-5 flex flex-row gap-4">
                      <div className="bg-gray-200 w-28 h-4 rounded-sm"></div>
                      <div className="bg-gray-200 w-20 h-4 rounded-sm"></div>
                      </div>
                    </div>
                  }
                >
                  <Jobcard key={job._id} {...job} />
                </Suspense>
              ))
            : "No Jobs"}
             
        </div>
        <div className="w-[25%] h-full"></div>
      </div>
    </div>
  );
};

export default Home;
