import { lazy, Suspense, useEffect, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setJobs } from "../features/Jobslice";
import { Appdispatch } from "../app/Store";
import HomeLoader from "../Components/HomeLoader";
import { JobcardProps } from "../utils/types";

const Jobcard = lazy(() => import("../Components/JobCard/Jobcard"));

const Jobs: React.FC = () => {
  const dispatch = useDispatch<Appdispatch>();
  const [jobs, setJobsList] = useState<JobcardProps[]>([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:5000/api/jobs/getjobs"
        );
        setJobsList(response.data.jobs);
        dispatch(setJobs(response.data.jobs));
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };
    fetchJobs();
  }, [dispatch]);

  return (
    <div className="relative w-full min-h-[88vh] mt-4 flex flex-row justify-center gap-24 p-4 bg-gray-50">
      <aside className="w-1/5 p-4 bg-white border border-gray-200 shadow-sm rounded-lg flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-gray-800">Filter Jobs</h2>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Category</label>
          <select className="p-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option>All Categories</option>
            <option>Software</option>
            <option>Marketing</option>
            <option>Finance</option>
          </select>
        </div>
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-gray-700">Location</label>
          <input
            type="text"
            placeholder="Enter location"
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        
        <div className="flex flex-col gap-3 select-none">
          <label className="text-sm font-medium text-gray-700">Job Type</label>

          <div className="flex gap-2">
            <input type="checkbox" id="fulltime" className="accent-blue-500" />
            <label htmlFor="fulltime" className="text-sm text-gray-700">
              Full-Time
            </label>
          </div>
          <div className="flex gap-2">
            <input type="checkbox" id="parttime" className="accent-blue-500" />
            <label htmlFor="parttime" className="text-sm text-gray-700">
              Part-Time
            </label>
          </div>
          <div className="flex gap-2">
            <input type="checkbox" id="contract" />
            <label htmlFor="contract" className="text-sm text-gray-700">
              Contractual
            </label>
          </div>
          <div className="flex gap-2">
            <input type="checkbox" id="internship" />
            <label htmlFor="internship" className="text-sm text-gray-700">
              Internship
            </label>
          </div>
        </div>
        <button className="mt-4 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition">
          Apply Filters
        </button>
      </aside>

      {/* Job Listings */}
      <main className="w-2/5 flex flex-col gap-4">
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <Suspense key={job._id} fallback={<HomeLoader />}>
              <Jobcard {...job} />
            </Suspense>
          ))
        ) : (
          <div className="bg-gray-100 py-6 px-4 rounded-lg text-center text-gray-600 text-lg">
            No Jobs Available
          </div>
        )}
      </main>

      {/* Right Sidebar (Reserved for future features) */}
      <aside className="w-1/5 p-4 bg-white border border-gray-200 shadow-sm rounded-lg" />
    </div>
  );
};

export default Jobs;
