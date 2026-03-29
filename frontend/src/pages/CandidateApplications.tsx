import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../app/Store";
import { getCandidateAppliedJobsService } from "../api/services";
import { toast } from "react-toastify";
import { Building2, MapPin, IndianRupee, Clock, CheckCircle, XCircle, SearchX } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

interface AppliedJob {
  _id: string;
  status: "Pending" | "Accepted" | "Rejected";
  createdAt: string;
  job_id: {
    _id: string;
    title: string;
    company: string;
    location: string;
    salary: string;
    jobtype: string;
  };
}

const CandidateApplications = () => {
  const [applications, setApplications] = useState<AppliedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const auth = useSelector((state: RootState) => state.auth);

  const fetchApplications = async () => {
    try {
      const response = await getCandidateAppliedJobsService();
      if (response.success) {
        setApplications(response.applications);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load your applications");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  if (!auth.isAuthenticated || auth.role !== "Candidate") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 font-medium">Please login as a Candidate to view your applications.</p>
      </div>
    );
  }

  return (
    <div className="min-h-[92vh] bg-[#fafafa] py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Applications</h1>
          <p className="text-gray-500 mt-1">Track the status of jobs you have applied for.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : applications.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {applications.map((app, idx) => (
              <motion.div 
                key={app._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-bold text-gray-900">{app.job_id.title}</h2>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                      {app.job_id.jobtype}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1"><Building2 size={14}/> {app.job_id.company}</span>
                    <span className="flex items-center gap-1"><MapPin size={14}/> {app.job_id.location}</span>
                    <span className="flex items-center gap-1 text-gray-400"><IndianRupee size={14}/> {app.job_id.salary} LPA</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                    <Clock size={12} /> Applied {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}
                  </div>
                </div>

                <div className="flex shrink-0">
                  <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 font-bold text-sm ${
                    app.status === "Accepted" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                    app.status === "Rejected" ? "bg-red-50 text-red-600 border-red-100" :
                    "bg-amber-50 text-amber-600 border-amber-100"
                  }`}>
                    {app.status === "Accepted" && <CheckCircle size={16} />}
                    {app.status === "Rejected" && <XCircle size={16} />}
                    {app.status === "Pending" && <Clock size={16} />}
                    {app.status}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-primary-50 text-primary-300 rounded-full flex items-center justify-center mb-4">
              <SearchX size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Applications Yet</h3>
            <p className="text-gray-500 mb-6 max-w-sm">You haven't applied to any jobs yet. Start exploring and apply for your dream role!</p>
            <a href="/" className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-all shadow-md shadow-primary-500/20 active:scale-95">
              Browse Jobs
            </a>
          </div>
        )}

      </div>
    </div>
  );
};

export default CandidateApplications;
