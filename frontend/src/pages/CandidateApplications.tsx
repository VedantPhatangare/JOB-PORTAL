import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../app/Store";
import { getCandidateAppliedJobsService, withdrawApplicationService } from "../api/services";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { 
  Building2, MapPin, IndianRupee, Clock, CheckCircle, 
  XCircle, FileText, ExternalLink, Trash2, SearchX
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "../Components/ConfirmationModal";

const CandidateApplications = () => {
  const auth = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [jobToWithdraw, setJobToWithdraw] = useState<{ id: string; title: string } | null>(null);

  const fetchApplications = async () => {
    if (!auth.isAuthenticated || auth.role !== "Candidate") return;
    
    setIsLoading(true);
    try {
      const response = await getCandidateAppliedJobsService();
      if (response.success && response.applications) {
        setApplications(response.applications);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load applications");
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = (jobId: string, jobTitle: string) => {
    setJobToWithdraw({ id: jobId, title: jobTitle });
    setWithdrawModalOpen(true);
  };

  const confirmWithdraw = async () => {
    if (!jobToWithdraw) return;

    setWithdrawingId(jobToWithdraw.id);
    try {
      const response = await withdrawApplicationService(jobToWithdraw.id);
      if (response.success) {
        toast.success("Application withdrawn successfully");
        setApplications((prev) => prev.filter((a) => a.job_id._id !== jobToWithdraw.id));
        setWithdrawModalOpen(false);
        setJobToWithdraw(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to withdraw application");
      setWithdrawingId(null);
    }
  };

  const cancelWithdraw = () => {
    setWithdrawModalOpen(false);
    setJobToWithdraw(null);
  };

  const getResumeUrl = (resumePath: string) => {
    if (!resumePath) return "";
    if (resumePath.startsWith("http")) return resumePath;
    const filename = resumePath.split(/[\\\/]/).pop();
    const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace("/api", "") : "http://localhost:5000";
    return `${baseUrl}/getresume/${filename}`;
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
        
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Applications</h1>
            <p className="text-gray-500 mt-1">Track the status of jobs you've applied for.</p>
          </div>
          {applications.length > 0 && (
            <div className="bg-white border border-gray-100 shadow-sm px-4 py-2 rounded-xl flex items-center gap-2 shrink-0">
              <span className="text-gray-500 text-sm font-semibold">Total</span>
              <span className="text-xl font-black text-primary-600">{applications.length}</span>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          </div>
        ) : applications.length > 0 ? (
          <div className="flex flex-col gap-4">
            <AnimatePresence>
              {applications.map((app, idx) => {
                const isWithdrawing = withdrawingId === app.job_id._id;
                
                return (
                  <motion.div 
                    key={app._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20, scale: 0.98 }}
                    transition={{ delay: idx * 0.04 }}
                    className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      {/* Company Logo / Initial */}
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center text-primary-600 font-bold text-xl shrink-0 border border-primary-50">
                        {app.job_id.company?.charAt(0)?.toUpperCase()}
                      </div>

                      {/* Job Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <button
                            onClick={() => navigate(`/job/${app.job_id._id}`)}
                            className="text-lg font-bold text-gray-900 hover:text-primary-600 transition-colors flex items-center gap-1.5 text-left"
                          >
                            {app.job_id.title}
                            <ExternalLink size={14} className="opacity-50 shrink-0" />
                          </button>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 shrink-0">
                            {app.job_id.jobtype}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-500 mb-3">
                          <span className="flex items-center gap-1"><Building2 size={14}/> {app.job_id.company}</span>
                          <span className="flex items-center gap-1"><MapPin size={14}/> {app.job_id.location}</span>
                          <span className="flex items-center gap-1 text-gray-400"><IndianRupee size={14}/> {app.job_id.salary} LPA</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                            <Clock size={12} /> Applied {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}
                          </span>
                          {app.resume && (
                            <button
                              onClick={() => window.open(getResumeUrl(app.resume), "_blank")}
                              className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-semibold"
                            >
                              <FileText size={12} /> View Resume
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Timeline & Actions Footer */}
                    <div className="mt-5 pt-5 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-8 sm:gap-4">
                      <div className="flex-1 w-full max-w-[320px] flex items-center relative pl-2">
                         {/* Node 1: Applied */}
                         <div className="flex flex-col items-center relative z-10 shrink-0">
                           <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center ring-[3px] ring-white shadow-sm border border-emerald-200">
                             <CheckCircle size={14} strokeWidth={3} />
                           </div>
                           <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mt-2 absolute -bottom-6 whitespace-nowrap">Applied</span>
                         </div>

                         {app.status === "Rejected" ? (
                           <>
                             {/* 2-Stage Timeline: Applied -> Rejected */}
                             <div className="flex-1 h-1 bg-gray-200 -mx-1 z-0 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] overflow-hidden">
                               <div className="h-full w-full bg-red-400" />
                             </div>
                             <div className="flex flex-col items-center relative z-10 shrink-0">
                               <div className="w-7 h-7 rounded-full bg-red-100 text-red-600 flex items-center justify-center ring-[3px] ring-white shadow-sm border border-red-200">
                                 <XCircle size={14} strokeWidth={3} />
                               </div>
                               <span className="text-[10px] font-bold text-red-700 uppercase tracking-widest mt-2 absolute -bottom-6 whitespace-nowrap">Rejected</span>
                             </div>
                           </>
                         ) : (
                           <>
                             {/* 3-Stage Timeline */}
                             <div className="flex-1 h-1 bg-gray-200 -mx-1 z-0 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] overflow-hidden">
                                 <div className={`h-full transition-all duration-700 ${["Shortlisted", "Accepted"].includes(app.status) ? 'w-full bg-emerald-400' : 'w-0 bg-emerald-400'}`} />
                             </div>
                             
                             <div className="flex flex-col items-center relative z-10 shrink-0">
                               <div className={`w-7 h-7 rounded-full flex items-center justify-center ring-[3px] ring-white shadow-sm border transition-colors duration-500 ${["Shortlisted", "Accepted"].includes(app.status) ? 'bg-emerald-100 text-emerald-600 border-emerald-200' : 'bg-gray-50 text-gray-300 border-gray-200'}`}>
                                 {["Shortlisted", "Accepted"].includes(app.status) ? <CheckCircle size={14} strokeWidth={3} /> : <Clock size={14} strokeWidth={3} />}
                               </div>
                               <span className={`text-[10px] font-bold uppercase tracking-widest mt-2 absolute -bottom-6 whitespace-nowrap transition-colors duration-500 ${["Shortlisted", "Accepted"].includes(app.status) ? 'text-emerald-700' : 'text-gray-400'}`}>Shortlisted</span>
                             </div>

                             <div className="flex-1 h-1 bg-gray-200 -mx-1 z-0 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] overflow-hidden">
                                 <div className={`h-full transition-all duration-700 ${app.status === "Accepted" ? 'w-full bg-emerald-400' : 'w-0 bg-emerald-400'}`} />
                             </div>
                             
                             <div className="flex flex-col items-center relative z-10 shrink-0 pr-2">
                               <div className={`w-7 h-7 rounded-full flex items-center justify-center ring-[3px] ring-white shadow-sm border transition-colors duration-500 ${app.status === "Accepted" ? 'bg-emerald-100 text-emerald-600 border-emerald-200' : 'bg-gray-50 text-gray-300 border-gray-200'}`}>
                                 {app.status === "Accepted" ? <CheckCircle size={14} strokeWidth={3} /> : <Clock size={14} strokeWidth={3} />}
                               </div>
                               <span className={`text-[10px] font-bold uppercase tracking-widest mt-2 absolute -bottom-6 whitespace-nowrap transition-colors duration-500 ${app.status === "Accepted" ? 'text-emerald-700' : 'text-gray-400'}`}>
                                 {app.status === "Accepted" ? "Hired" : "Final"}
                               </span>
                             </div>
                           </>
                         )}
                      </div>

                      <div className="shrink-0 flex flex-col items-end gap-2 mt-4 sm:mt-0 pt-2 sm:pt-0">
                        {["Pending", "Shortlisted"].includes(app.status) && (
                          <button
                            onClick={() => handleWithdraw(app.job_id._id, app.job_id.title)}
                            disabled={isWithdrawing}
                            className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50"
                          >
                            <Trash2 size={13} />
                            {isWithdrawing ? "Withdrawing..." : "Withdraw"}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
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

        {/* Withdraw Confirmation Modal */}
        <ConfirmationModal
          isOpen={withdrawModalOpen}
          title="Withdraw Application"
          message={`Are you sure you want to withdraw your application for ${jobToWithdraw?.title}? This action cannot be undone.`}
          confirmText={withdrawingId ? "Withdrawing..." : "Withdraw"}
          cancelText="Keep Application"
          variant="danger"
          isDangerous={true}
          isLoading={!!withdrawingId}
          onConfirm={confirmWithdraw}
          onCancel={cancelWithdraw}
        />
      </div>
    </div>
  );
};

export default CandidateApplications;
