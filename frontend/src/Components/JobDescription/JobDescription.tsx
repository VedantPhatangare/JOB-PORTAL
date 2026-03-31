import { RootState } from "../../app/Store";
import { useSelector, useDispatch } from "react-redux";
import { toggleBookmark } from "../../features/Authslice";
import { useParams, useNavigate } from "react-router-dom";
import { JobcardProps } from "../../utils/types";
import React, { useEffect, useState } from "react";
import { DetailCard } from "../DetailCard";
import { format } from "date-fns";
import { 
  Building2, 
  MapPin, 
  IndianRupee, 
  Briefcase, 
  Clock, 
  UploadCloud, 
  FileText, 
  CheckCircle, 
  XSquare, 
  Loader2,
  ChevronLeft,
  Tags,
  Link
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { 
  applyForJobService, 
  getApplicantDetailsService, 
  toggleBookmarkJobService 
} from "../../api/services";
import { Heart } from "lucide-react";

const JobDescription = () => {
  const { job_id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const jobs = useSelector((state: RootState) => state.jobs.jobs);
  const userInfo = useSelector((state: RootState) => state.auth);

  const currentJob: JobcardProps | undefined = jobs.find(
    (job) => job._id === job_id
  );

  const [resume, setResume] = useState<File | null>(null);
  const [coverletter, setCoverletter] = useState<File | null>(null);
  const [useResumeUrl, setUseResumeUrl] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"Pending" | "Accepted" | "Rejected" | "Shortlisted" | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);

  const isBookmarked = userInfo.savedJobs.includes(job_id || "");
  const isExpired = currentJob?.deadline ? new Date() > new Date(currentJob.deadline) : false;

  useEffect(() => {
    if (userInfo.resumeUrl) {
      setUseResumeUrl(true);
    }
  }, [userInfo.resumeUrl]);

  const fetchStatus = async () => {
    if (!userInfo.isAuthenticated || userInfo.role !== "Candidate" || !job_id) {
      setIsLoadingStatus(false);
      return;
    }
    try {
      const response = await getApplicantDetailsService(userInfo.id, job_id);
      if (response.success && response.application) {
        setStatus(response.application.status);
      }
    } catch (error) {
      // Silent — 404 means not applied
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const handleToggleBookmark = async () => {
    if (!userInfo.isAuthenticated) {
      toast.info("Please log in to bookmark jobs.");
      navigate("/login");
      return;
    }
    if (!job_id) return;

    setIsBookmarkLoading(true);
    try {
      const response = await toggleBookmarkJobService(job_id);
      if (response.success) {
        dispatch(toggleBookmark(job_id));
        toast.success(response.isBookmarked ? "Job bookmarked!" : "Removed from bookmarks");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to toggle bookmark");
    } finally {
      setIsBookmarkLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // eslint-disable-next-line
  }, [userInfo.isAuthenticated, job_id]);

  const handleApply = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!userInfo.isAuthenticated) {
      toast.info("Please log in to apply for this job.");
      navigate("/login");
      return;
    }

    const canSubmit = useResumeUrl ? !!userInfo.resumeUrl : !!resume;
    if (!canSubmit) {
      toast.error("Please provide your resume to apply.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    if (useResumeUrl && userInfo.resumeUrl) {
      formData.append("resumeUrl", userInfo.resumeUrl);
    } else if (resume) {
      formData.append("resume", resume);
    }

    if (coverletter) formData.append("coverletter", coverletter);

    try {
      if (!job_id) throw new Error("Invalid job ID");
      const response = await applyForJobService(job_id, formData);
      if (response.success) {
        toast.success("Application submitted successfully!");
        setResume(null);
        setCoverletter(null);
        fetchStatus();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentJob) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center bg-[#fafafa]">
        <div className="text-center">
          <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Job Not Found</h2>
          <p className="text-gray-500 mt-2">The job you are looking for might have been removed.</p>
          <button 
            onClick={() => navigate("/")}
            className="mt-6 px-6 py-2 bg-primary-600 text-white rounded-full font-medium hover:bg-primary-700 transition"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  const getStatusConfig = () => {
    switch(status) {
      case "Accepted": return { color: "text-emerald-600", bg: "bg-emerald-50", icon: <CheckCircle size={16} /> };
      case "Rejected": return { color: "text-red-600", bg: "bg-red-50", icon: <XSquare size={16} /> };
      case "Shortlisted": return { color: "text-primary-600", bg: "bg-primary-50", icon: <CheckCircle size={16} /> };
      case "Pending": return { color: "text-amber-600", bg: "bg-amber-50", icon: <Clock size={16} /> };
      default: return null;
    }
  };
  const statusConfig = getStatusConfig();

  return (
    <div className="min-h-[92vh] bg-[#fafafa] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-6"
        >
          <ChevronLeft size={16} /> Back to listings
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Content */}
          <div className="flex-1 w-full space-y-6">
            
            {/* Header Card */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-bl-full -z-10 opacity-50 blur-2xl"></div>
              
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl flex items-center justify-center text-primary-600 font-bold text-3xl shadow-inner border border-primary-50 shrink-0">
                  {currentJob.companyLogo ? (
                    <img src={currentJob.companyLogo} alt={currentJob.company} className="w-full h-full object-contain rounded-2xl p-2" />
                  ) : (
                    currentJob.company.charAt(0).toUpperCase()
                  )}
                </div>
                
                <div className="flex-1">
                  <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
                    {currentJob.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-gray-600 font-medium">
                    <span className="flex items-center gap-1.5"><Building2 size={16} className="text-gray-400" /> {currentJob.company}</span>
                    <span className="flex items-center gap-1.5"><MapPin size={16} className="text-gray-400" /> {currentJob.location}</span>
                    <span className="text-xs text-gray-400 font-normal">Posted by {currentJob.postedBy?.name}</span>
                  </div>
                </div>

                  <div className="flex items-center gap-3 ml-auto">
                    {userInfo.isAuthenticated && userInfo.role === "Candidate" && (
                      <button
                        onClick={handleToggleBookmark}
                        disabled={isBookmarkLoading}
                        className={`p-3 rounded-2xl border transition-all duration-300 ${
                          isBookmarked 
                            ? "bg-red-50 border-red-100 text-red-500" 
                            : "bg-white border-gray-100 text-gray-400 hover:text-red-400 hover:border-red-100"
                        }`}
                      >
                        {isBookmarkLoading ? (
                          <Loader2 size={24} className="animate-spin" />
                        ) : (
                          <Heart size={24} fill={isBookmarked ? "currentColor" : "none"} />
                        )}
                      </button>
                    )}
                    {statusConfig && (
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm ${statusConfig.bg} ${statusConfig.color} border border-white/20 shadow-sm whitespace-nowrap`}>
                        {statusConfig.icon}
                        <span>{status}</span>
                      </div>
                    )}
                  </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <DetailCard icon={<IndianRupee size={20} />} label="Salary" value={`${currentJob.salary} LPA`} />
              {currentJob.experience && <DetailCard icon={<Clock size={20} />} label="Experience" value={currentJob.experience} />}
              <DetailCard icon={<Briefcase size={20} />} label="Job Type" value={currentJob.jobtype} />
              {currentJob.deadline && <DetailCard icon={<Clock size={20} />} label="Deadline" value={format(new Date(currentJob.deadline), "MMM dd, yyyy")} />}
            </div>


            {/* Required Skills */}
            {currentJob.skills && currentJob.skills.length > 0 && (
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Tags size={18} className="text-primary-500" /> Required Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {currentJob.skills.map(skill => (
                    <span key={skill} className="px-3 py-1.5 rounded-full text-sm font-semibold bg-primary-50 text-primary-700 border border-primary-100">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">About the Role</h2>
              <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                {currentJob.description || "No detailed description provided for this role."}
              </div>
            </div>

          </div>

          {/* Sidebar / Apply Section */}
          <div className="w-full lg:w-[400px] shrink-0">
            <div className="lg:sticky lg:top-24 space-y-4">
              
              {userInfo.role !== "Recruiter" && (
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary-400 to-primary-600"></div>

                  {isLoadingStatus ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Loader2 className="animate-spin text-primary-400 mb-4" size={32} />
                      <p className="text-gray-400 text-sm font-medium">Checking status...</p>
                    </div>
                  ) : isExpired && !status ? (
                    <div className="text-center py-6">
                      <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Application Closed</h3>
                      <p className="text-gray-500 text-sm">The deadline for this job has passed. You can no longer apply for this position.</p>
                      <button 
                        disabled
                        className="w-full mt-6 py-3 bg-gray-50 text-gray-400 font-bold rounded-xl border border-gray-100 cursor-not-allowed"
                      >
                        Expired
                      </button>
                    </div>
                  ) : status ? (
                    <div className="space-y-8">
                       <div className="text-center">
                         <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 ${statusConfig?.bg} ${statusConfig?.color}`}>
                           {statusConfig?.icon}
                         </div>
                         <h3 className="text-lg font-bold text-gray-900">Application Status</h3>
                         <p className="text-gray-500 text-sm mt-1">You've successfully applied for this role.</p>
                       </div>

                       {/* Status Timeline */}
                       <div className="relative pt-2 pb-8 px-4">
                          <div className="flex items-center w-full relative">
                             {/* Applied Node */}
                             <div className="flex flex-col items-center relative z-10">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center border-2 border-white shadow-sm">
                                   <CheckCircle size={14} strokeWidth={3} />
                                </div>
                                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mt-2 absolute -bottom-5 whitespace-nowrap">Applied</span>
                             </div>

                             {status === "Rejected" ? (
                               <>
                                  <div className="flex-1 h-1 bg-red-400 -mx-1" />
                                  <div className="flex flex-col items-center relative z-10">
                                     <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center border-2 border-white shadow-sm">
                                        <XSquare size={14} strokeWidth={3} />
                                     </div>
                                     <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider mt-2 absolute -bottom-5 whitespace-nowrap">Rejected</span>
                                  </div>
                               </>
                             ) : (
                               <>
                                  <div className={`flex-1 h-1 -mx-1 ${["Shortlisted", "Accepted"].includes(status) ? 'bg-emerald-400' : 'bg-gray-100'}`} />
                                  <div className="flex flex-col items-center relative z-10">
                                     <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-sm transition-colors ${["Shortlisted", "Accepted"].includes(status) ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                                        {["Shortlisted", "Accepted"].includes(status) ? <CheckCircle size={14} strokeWidth={3} /> : <Clock size={14} strokeWidth={3} />}
                                     </div>
                                     <span className={`text-[10px] font-bold uppercase tracking-wider mt-2 absolute -bottom-5 whitespace-nowrap ${["Shortlisted", "Accepted"].includes(status) ? 'text-emerald-600' : 'text-gray-400'}`}>Shortlisted</span>
                                  </div>

                                  <div className={`flex-1 h-1 -mx-1 ${status === "Accepted" ? 'bg-emerald-400' : 'bg-gray-100'}`} />
                                  <div className="flex flex-col items-center relative z-10">
                                     <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-sm transition-colors ${status === "Accepted" ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                                        {status === "Accepted" ? <CheckCircle size={14} strokeWidth={3} /> : <Clock size={14} strokeWidth={3} />}
                                     </div>
                                     <span className={`text-[10px] font-bold uppercase tracking-wider mt-2 absolute -bottom-5 whitespace-nowrap ${status === "Accepted" ? 'text-emerald-600' : 'text-gray-400'}`}>Hired</span>
                                  </div>
                               </>
                             )}
                          </div>
                       </div>
                    </div>
                  ) : (
                    <form onSubmit={handleApply} className="space-y-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-2">Apply for this position</h2>
                      <p className="text-sm text-gray-500 mb-6">Complete the form below to submit your application.</p>

                      {/* Resume Upload */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Resume <span className="text-red-500">*</span></label>

                        {/* Toggle saved resume vs upload */}
                        {userInfo.resumeUrl && (
                          <div className="flex gap-2 mb-3">
                            <button
                              type="button"
                              onClick={() => setUseResumeUrl(true)}
                              className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-all ${useResumeUrl ? "bg-primary-600 text-white shadow-md shadow-primary-500/20" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                            >
                              Use Saved
                            </button>
                            <button
                              type="button"
                              onClick={() => setUseResumeUrl(false)}
                              className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-all ${!useResumeUrl ? "bg-primary-600 text-white shadow-md shadow-primary-500/20" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                            >
                              Upload New
                            </button>
                          </div>
                        )}

                        {useResumeUrl && userInfo.resumeUrl ? (
                          <div className="flex items-center gap-3 px-4 py-3 bg-primary-50 border border-primary-200 rounded-xl group hover:border-primary-300 transition-colors">
                            <Link size={18} className="text-primary-600 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-[10px] font-bold text-primary-500 uppercase tracking-wider">Saved Resume</p>
                              <a href={userInfo.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-700 truncate block hover:underline font-medium">
                                View Current Resume
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="relative group">
                            <input 
                              type="file" 
                              id="resume" 
                              accept=".pdf,.doc,.docx"
                              className="hidden" 
                              onChange={(e) => setResume(e.target.files?.[0] || null)}
                            />
                            <label 
                              htmlFor="resume" 
                              className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${resume ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-400 hover:bg-gray-50'}`}
                            >
                              <AnimatePresence mode="wait">
                                {resume ? (
                                  <motion.div 
                                    initial={{ scale: 0.8, opacity: 0 }} 
                                    animate={{ scale: 1, opacity: 1 }} 
                                    className="flex flex-col items-center text-primary-600"
                                  >
                                    <FileText className="mb-2" size={28} />
                                    <span className="text-sm font-semibold text-center px-4 truncate w-full">{resume.name}</span>
                                  </motion.div>
                                ) : (
                                  <motion.div className="flex flex-col items-center text-gray-400 group-hover:text-primary-500 transition-colors">
                                    <UploadCloud className="mb-2" size={28} />
                                    <span className="text-sm font-medium">Click to upload resume</span>
                                    <span className="text-xs text-gray-400 mt-1">PDF, DOC up to 5MB</span>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </label>
                          </div>
                        )}
                      </div>

                      {/* Cover Letter Upload */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Cover Letter <span className="text-gray-400 font-normal ml-1">(Optional)</span></label>
                        <div className="relative group">
                          <input 
                            type="file" 
                            id="coverletter" 
                            accept=".pdf,.doc,.docx"
                            className="hidden" 
                            onChange={(e) => setCoverletter(e.target.files?.[0] || null)}
                          />
                          <label 
                            htmlFor="coverletter" 
                            className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${coverletter ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-400 hover:bg-gray-50'}`}
                          >
                            <AnimatePresence mode="wait">
                              {coverletter ? (
                                <motion.div 
                                  initial={{ scale: 0.8, opacity: 0 }} 
                                  animate={{ scale: 1, opacity: 1 }} 
                                  className="flex flex-col items-center text-indigo-600"
                                >
                                  <FileText className="mb-1" size={20} />
                                  <span className="text-xs font-semibold text-center px-4 truncate w-full">{coverletter.name}</span>
                                </motion.div>
                              ) : (
                                <motion.div className="flex flex-col items-center text-gray-400 group-hover:text-indigo-500 transition-colors">
                                  <UploadCloud className="mb-1" size={20} />
                                  <span className="text-xs font-medium">Click to upload cover letter</span>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </label>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting || (!useResumeUrl && !resume)}
                        className="w-full flex justify-center py-3.5 px-4 rounded-xl text-white font-bold bg-primary-600 hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed group mt-2"
                      >
                        {isSubmitting ? (
                          <Loader2 className="animate-spin" size={20} />
                        ) : (
                          <span className="flex items-center gap-2">Submit Application <ChevronLeft className="rotate-180 group-hover:translate-x-1 transition-transform" size={16} /></span>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Company info block */}
              {currentJob.postedBy && (
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Posted by</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 font-bold text-lg shrink-0">
                      {currentJob.company?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{currentJob.company}</p>
                      <p className="text-xs text-gray-500">{currentJob.postedBy.name}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDescription;
