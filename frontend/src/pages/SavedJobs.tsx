import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../app/Store";
import { getSavedJobsService } from "../api/services";
import Jobcard from "../Components/JobCard/Jobcard";
import { LayoutGrid, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { JobcardProps } from "../utils/types";

const SavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState<JobcardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const auth = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  const fetchSavedJobs = async () => {
    try {
      const response = await getSavedJobsService();
      if (response.success) {
        setSavedJobs(response.jobs);
      }
    } catch (error) {
      console.error("Failed to fetch saved jobs", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (auth.isAuthenticated) {
      fetchSavedJobs();
    }
  }, [auth.isAuthenticated]);

  return (
    <div className="min-h-screen bg-[#fafafa] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <header className="mb-10 text-center lg:text-left">
          <button 
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-2xl text-primary-600 font-bold text-sm mb-4 hover:bg-primary-100 transition-colors active:scale-95 cursor-pointer"
          >
            <LayoutGrid size={16} /> Dashboard
          </button>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Saved <span className="text-primary-600">Jobs</span>
          </h1>
          <p className="text-gray-500 mt-3 text-lg font-medium">
            Manage and track the opportunities you've bookmarked.
          </p>
        </header>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="animate-spin text-primary-500 mb-4" size={48} />
            <p className="text-gray-400 font-medium">Loading your bookmarked jobs...</p>
          </div>
        ) : savedJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <AnimatePresence>
              {savedJobs.map((job, idx) => (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Jobcard {...job} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] p-16 text-center border border-gray-100 shadow-sm max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-300">
               <LayoutGrid size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No saved jobs yet</h2>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              Start exploring positions and bookmark the ones that catch your eye.
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-primary-600 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 active:scale-95"
            >
              Browse Jobs
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedJobs;
