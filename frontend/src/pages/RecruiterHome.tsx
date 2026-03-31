import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Appdispatch, RootState } from "../app/Store";
import { JobcardProps } from "../utils/types";
import JobpostCard from "../Components/JobPostCard/JobpostCard";
import { setJobs } from "../features/Jobslice";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createJobSchema, CreateJobFormValues } from "../validations/job";
import { createJobService, getCategoriesService, updateJobService } from "../api/services";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Briefcase, Building2, MapPin, IndianRupee, Loader2, X, Tags, UserCircle, TrendingUp, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RecruiterHome = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobcardProps | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [jobSkills, setJobSkills] = useState<string[]>([]);

  const jobs = useSelector((state: RootState) => state.jobs.jobs);
  const auth = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<Appdispatch>();
  const navigate = useNavigate();

  const postedJobs = jobs?.filter((job) => job.postedBy?.id === auth.id) || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CreateJobFormValues>({
    resolver: zodResolver(createJobSchema)
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategoriesService();
        if (response.success && response.categories) {
          setCategories(response.categories);
        }
      } catch (error) {
        console.error("Failed to load categories", error);
      }
    };
    fetchCategories();
  }, [isModalOpen]);

  const openCreateModal = () => {
    setEditingJob(null);
    reset({
      title: "",
      company: auth.companyName || "",
      location: "",
      salary: "",
      category: "",
      jobtype: "" as any,
      experience: "" as any,
      description: "",
      deadline: ""
    });
    setJobSkills([]);
    setIsModalOpen(true);
  };

  const openEditModal = (job: JobcardProps) => {
    setEditingJob(job);
    reset({
      title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary,
      category: job.category || "",
      jobtype: job.jobtype as any,
      experience: job.experience as any,
      description: job.description || "",
      deadline: job.deadline ? new Date(job.deadline).toISOString().split("T")[0] : ""
    });
    setJobSkills(job.skills || []);
    setIsModalOpen(true);
  };


  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !jobSkills.includes(trimmed)) {
      setJobSkills([...jobSkills, trimmed]);
    }
    setSkillInput("");
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill();
    }
    if (e.key === "Backspace" && !skillInput && jobSkills.length > 0) {
      setJobSkills(jobSkills.slice(0, -1));
    }
  };

  const handleSaveJob = async (data: CreateJobFormValues) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });
      // Append skills
      jobSkills.forEach(s => formData.append("skills", s));

      if (editingJob) {
        // Update Mode
        const response = await updateJobService(editingJob._id, formData);
        if (response.success && response.job) {
          toast.success("Job updated successfully!");
          const newJobs = jobs.map((j) => (j._id === editingJob._id ? response.job : j));
          dispatch(setJobs(newJobs));
          setIsModalOpen(false);
        } else {
          toast.error(response.message || "Failed to update job.");
        }
      } else {
        // Create Mode
        const response = await createJobService(formData);
        if (response.success && response.job) {
          toast.success("Job posted successfully!");
          const newJobs = [...jobs, response.job];
          dispatch(setJobs(newJobs));
          reset();
          setJobSkills([]);
          setSkillInput("");
          setIsModalOpen(false);
        } else {
          toast.error(response.message || "Failed to create job.");
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "An error occurred while saving the job.");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="min-h-[92vh] bg-[#fafafa] py-8 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Welcome back, <span className="text-primary-600">{auth.name}</span>
            </h1>
            {auth.companyName ? (
               <p className="text-gray-500 mt-1 font-medium">Managing jobs for <span className="text-gray-900 font-bold">{auth.companyName}</span></p>
            ) : (
               <p className="text-gray-500 mt-1">Here is what's happening today.</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/profile/recruiter")}
              className="flex items-center gap-2 border border-gray-200 text-gray-700 bg-white px-4 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-all text-sm"
            >
              <UserCircle size={16} /> Edit Profile
            </button>
            <button 
              onClick={openCreateModal}
              className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md shadow-primary-500/20 hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-500/30 transition-all active:scale-95"
            >
              <Plus size={20} /> Post New Job
            </button>
          </div>
        </div>


        {/* Stats Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
                <Briefcase size={18} />
              </div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Jobs</span>
            </div>
            <p className="text-3xl font-black text-gray-900 mt-2">{postedJobs.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <TrendingUp size={18} />
              </div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Company</span>
            </div>
            <p className="text-lg font-black text-gray-900 mt-2 truncate">{auth.companyName || "—"}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm col-span-2 sm:col-span-1">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <UserCircle size={18} />
              </div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Profile</span>
            </div>
            <p className="text-sm font-semibold text-gray-600 mt-2 truncate">{auth.name}</p>
          </div>
        </div>

        {/* Posted Jobs */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm min-h-[40vh]">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Briefcase className="text-primary-500" size={24} /> 
            Active Job Postings <span className="bg-primary-50 text-primary-700 text-sm py-1 px-3 rounded-full ml-2">{postedJobs.length}</span>
          </h2>
          
          {postedJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {postedJobs.map((job: JobcardProps) => (
                <JobpostCard key={job._id} {...job} onEdit={() => openEditModal(job)} />
              ))}
            </div>

          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-primary-50 text-primary-300 rounded-full flex items-center justify-center mb-4">
                <Briefcase size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No jobs posted yet</h3>
              <p className="text-gray-500 max-w-sm mb-6">Create your first job posting to start receiving applications from top candidates.</p>
              <button 
                onClick={openCreateModal}
                className="text-primary-600 font-semibold hover:text-primary-700 transition"
              >
                + Create a Job Post
              </button>

            </div>
          )}
        </div>

      </div>

      {/* Create Job Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col mx-2"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                   <div className="bg-primary-100 text-primary-600 p-1.5 rounded-lg">
                     {editingJob ? <TrendingUp size={20} /> : <Plus size={20} />}
                   </div>
                   {editingJob ? "Edit Job Posting" : "Create New Job Post"}
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar">
                <form id="save-job-form" onSubmit={handleSubmit(handleSaveJob)} className="space-y-5">

                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Job Title</label>
                      <input 
                        type="text" 
                        {...register("title")} 
                        className={`w-full px-4 py-2.5 bg-gray-50 border ${errors.title ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:border-primary-500 focus:ring-primary-500'} rounded-xl text-sm transition-all focus:bg-white focus:outline-none focus:ring-2`}
                        placeholder="e.g. Senior Frontend Developer"
                      />
                      {errors.title && <p className="mt-1 text-xs text-red-500 ml-1">{errors.title.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Category</label>
                      <div className="relative">
                        <Tags size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                          type="text" 
                          list="category-suggestions"
                          {...register("category")} 
                          className={`w-full pl-9 pr-4 py-2.5 bg-gray-50 border ${errors.category ? 'border-red-300' : 'border-gray-200'} rounded-xl text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500`}
                          placeholder="Select or type new category..."
                        />
                        <datalist id="category-suggestions">
                          {categories.map((cat) => (<option key={cat} value={cat} />))}
                          <option value="Software" />
                          <option value="Finance" />
                          <option value="Marketing" />
                        </datalist>
                      </div>
                      {errors.category && <p className="mt-1 text-xs text-red-500 ml-1">{errors.category.message}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Company Name</label>
                      <div className="relative">
                        <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                          type="text" 
                          {...register("company")} 
                          defaultValue={auth.companyName || ""}
                          className={`w-full pl-9 pr-4 py-2.5 bg-gray-50 border ${errors.company ? 'border-red-300' : 'border-gray-200'} rounded-xl text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500`}
                          placeholder="e.g. Google, Apple"
                        />
                      </div>
                      {errors.company && <p className="mt-1 text-xs text-red-500 ml-1">{errors.company.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Location</label>
                      <div className="relative">
                        <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                          type="text" 
                          {...register("location")} 
                          className={`w-full pl-9 pr-4 py-2.5 bg-gray-50 border ${errors.location ? 'border-red-300' : 'border-gray-200'} rounded-xl text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500`}
                          placeholder="e.g. Remote, New York"
                        />
                      </div>
                      {errors.location && <p className="mt-1 text-xs text-red-500 ml-1">{errors.location.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Salary (LPA)</label>
                      <div className="relative">
                        <IndianRupee size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                          type="text" 
                          {...register("salary")} 
                          className={`w-full pl-9 pr-4 py-2.5 bg-gray-50 border ${errors.salary ? 'border-red-300' : 'border-gray-200'} rounded-xl text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500`}
                          placeholder="e.g. 10 - 15"
                        />
                      </div>
                      {errors.salary && <p className="mt-1 text-xs text-red-500 ml-1">{errors.salary.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Job Type</label>
                      <select 
                        {...register("jobtype")}
                        className={`w-full px-4 py-2.5 bg-gray-50 border ${errors.jobtype ? 'border-red-300' : 'border-gray-200'} rounded-xl text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      >
                        <option value="">Select Job Type</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                      </select>
                      {errors.jobtype && <p className="mt-1 text-xs text-red-500 ml-1">{errors.jobtype.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Experience Level</label>
                      <select 
                        {...register("experience")}
                        className={`w-full px-4 py-2.5 bg-gray-50 border ${errors.experience ? 'border-red-300' : 'border-gray-200'} rounded-xl text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      >
                        <option value="">Select Experience</option>
                        <option value="Fresher">Fresher (0-1 years)</option>
                        <option value="1-3 Years">1-3 Years</option>
                        <option value="3-5 Years">3-5 Years</option>
                        <option value="5+ Years">5+ Years</option>
                      </select>
                      {errors.experience && <p className="mt-1 text-xs text-red-500 ml-1">{errors.experience.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Application Deadline</label>
                      <input 
                        type="date"
                        min={new Date().toISOString().split('T')[0]} // Block past dates
                        {...register("deadline")}
                        className={`w-full px-4 py-2.5 bg-gray-50 border ${errors.deadline ? 'border-red-300' : 'border-gray-200'} rounded-xl text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      />
                      {errors.deadline && <p className="mt-1 text-xs text-red-500 ml-1">{errors.deadline.message}</p>}
                    </div>
                  </div>

                  {/* Required Skills Tag Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Required Skills</label>
                    <div className="w-full min-h-[2.75rem] px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl flex flex-wrap gap-2 items-center focus-within:ring-2 focus-within:ring-primary-400 focus-within:bg-white transition-all">
                      <AnimatePresence>
                        {jobSkills.map((s) => (
                          <motion.span
                            key={s}
                            initial={{ opacity: 0, scale: 0.7 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.7 }}
                            className="inline-flex items-center gap-1.5 bg-primary-100 text-primary-700 text-xs font-semibold px-2.5 py-1 rounded-full"
                          >
                            {s}
                            <button type="button" onClick={() => setJobSkills(jobSkills.filter(x => x !== s))}>
                              <X size={10} />
                            </button>
                          </motion.span>
                        ))}
                      </AnimatePresence>
                      <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={handleSkillKeyDown}
                        placeholder={jobSkills.length === 0 ? "e.g. React, Node.js..." : "Add more..."}
                        className="flex-1 min-w-[120px] bg-transparent text-sm focus:outline-none placeholder-gray-400"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1 ml-1">Press Enter or comma to add. These help match your job to candidates.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Job Description</label>
                    <textarea 
                      {...register("description")}
                      rows={5}
                      className={`w-full px-4 py-3 bg-gray-50 border ${errors.description ? 'border-red-300' : 'border-gray-200'} rounded-xl text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none`}
                      placeholder="Describe the responsibilities, requirements, and benefits..."
                    />
                    {errors.description && <p className="mt-1 text-xs text-red-500 ml-1">{errors.description.message}</p>}
                  </div>

                </form>
              </div>

              <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-white">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  form="save-job-form"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl font-semibold text-white bg-primary-600 hover:bg-primary-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : editingJob ? <Save size={18} /> : <><Plus size={18} /> Publish Job</>}
                  {editingJob && !isSubmitting && "Update Job"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RecruiterHome;
