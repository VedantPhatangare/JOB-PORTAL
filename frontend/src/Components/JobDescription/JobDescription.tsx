import { RootState } from "../../app/Store";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { JobcardProps } from "../../utils/types";
import React, { useEffect, useState } from "react";
import { DetailCard } from "../DetailCard";
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
  ChevronLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { applyForJobService, getApplicantDetailsService } from "../../api/services";

const JobDescription = () => {
  const { job_id } = useParams();
  const navigate = useNavigate();

  const jobs = useSelector((state: RootState) => state.jobs.jobs);
  const userInfo = useSelector((state: RootState) => state.auth);

  const currentJob: JobcardProps | undefined = jobs.find(
    (job) => job._id === job_id
  );

  const [resume, setResume] = useState<File | null>(null);
  const [coverletter, setCoverletter] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"Pending" | "Accepted" | "Rejected" | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

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
       // Silent swallow on 404 meaning not applied
    } finally {
      setIsLoadingStatus(false);
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

    if (!resume) {
      toast.error("Please upload your resume to apply.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("resume", resume);
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

                {statusConfig && (
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm ${statusConfig.bg} ${statusConfig.color} border border-white/20 shadow-sm`}>
                    {statusConfig.icon}
                    <span>Status: {status}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <DetailCard icon={<IndianRupee size={20} />} label="Salary" value={`${currentJob.salary} LPA`} />
              {currentJob.experience && <DetailCard icon={<Clock size={20} />} label="Experience" value={currentJob.experience} />}
              <DetailCard icon={<Briefcase size={20} />} label="Job Type" value={currentJob.jobtype} />
              <DetailCard icon={<MapPin size={20} />} label="Location" value={currentJob.location} />
            </div>

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
            <div className="lg:sticky lg:top-24">
              {isLoadingStatus ? (
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-center min-h-[300px]">
                  <Loader2 className="animate-spin text-primary-400" size={32} />
                </div>
              ) : status ? (
                 <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
                    <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${statusConfig?.bg} ${statusConfig?.color}`}>
                       {statusConfig?.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Application {status}</h3>
                    <p className="text-sm text-gray-500">
                      {status === "Pending" ? "Your application is currently being reviewed by the team. We'll notify you if there are any updates." :
                       status === "Accepted" ? "Congratulations! The recruiter has marked your application as accepted." :
                       "Unfortunately, the recruiter has decided to pass on your application at this time."}
                    </p>
                 </div>
              ) : (
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-primary-500/5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-400 to-primary-600"></div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Apply Now</h3>
                  
                  {!userInfo.isAuthenticated ? (
                    <div className="text-center py-6">
                      <p className="text-gray-500 mb-6 text-sm">You need to be signed in as a candidate to apply for this position.</p>
                      <button 
                        onClick={() => navigate("/login")}
                        className="w-full bg-gray-900 text-white font-semibold py-3 rounded-xl hover:bg-black transition-colors"
                      >
                        Sign In to Apply
                      </button>
                    </div>
                  ) : userInfo.role === "Recruiter" ? (
                    <div className="text-center py-6">
                       <p className="text-amber-600 bg-amber-50 p-4 rounded-xl text-sm font-medium">
                         Recruiters cannot apply for jobs. Please log in as a candidate.
                       </p>
                    </div>
                  ) : (
                    <form onSubmit={handleApply} className="space-y-5">
                      
                      {/* Resume Upload */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Resume <span className="text-red-500">*</span></label>
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
                        disabled={isSubmitting || !resume}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDescription;
