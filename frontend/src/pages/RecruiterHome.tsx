import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Appdispatch, RootState } from "../app/Store";
import { JobcardProps } from "../utils/types";
import JobpostCard from "../Components/JobPostCard/JobpostCard";
import { setJobs } from "../features/Jobslice";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createJobSchema, CreateJobFormValues } from "../validations/job";
import { createJobService, getCategoriesService } from "../api/services";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Briefcase, Building2, MapPin, IndianRupee, Loader2, X, Tags } from "lucide-react";

const RecruiterHome = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  const jobs = useSelector((state: RootState) => state.jobs.jobs);
  const auth = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<Appdispatch>();

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
  }, [isCreateModalOpen]); // Fetch when they open the modal so it's fresh

  const handleCreateJob = async (data: CreateJobFormValues) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const response = await createJobService(formData);
      if (response.success && response.job) {
        toast.success("Job posted successfully!");
        const newJobs = [...jobs, response.job];
        dispatch(setJobs(newJobs));
        reset();
        setIsCreateModalOpen(false);
      } else {
        toast.error(response.message || "Failed to create job.");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "An error occurred while creating the job.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[92vh] bg-[#fafafa] py-8 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Recruiter Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage your job postings and applicants</p>
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md shadow-purple-500/20 hover:bg-purple-700 hover:shadow-lg hover:shadow-purple-500/30 transition-all active:scale-95"
          >
            <Plus size={20} /> Post New Job
          </button>
        </div>

        {/* Existing Jobs */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm min-h-[60vh]">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Briefcase className="text-purple-500" size={24} /> 
            Active Job Postings <span className="bg-purple-50 text-purple-700 text-sm py-1 px-3 rounded-full ml-2">{postedJobs.length}</span>
          </h2>
          
          {postedJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {postedJobs.map((job: JobcardProps) => (
                <JobpostCard key={job._id} {...job} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-purple-50 text-purple-300 rounded-full flex items-center justify-center mb-4">
                <Briefcase size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No jobs posted yet</h3>
              <p className="text-gray-500 max-w-sm mb-6">Create your first job posting to start receiving applications from top candidates.</p>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="text-purple-600 font-semibold hover:text-purple-700 transition"
              >
                + Create a Job Post
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Create Job Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                   <div className="bg-purple-100 text-purple-600 p-1.5 rounded-lg"><Plus size={20} /></div>
                   Create New Job Post
                </h2>
                <button 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar">
                <form id="create-job-form" onSubmit={handleSubmit(handleCreateJob)} className="space-y-5">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Job Title</label>
                      <input 
                        type="text" 
                        {...register("title")} 
                        className={`w-full px-4 py-2.5 bg-gray-50 border ${errors.title ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:border-purple-500 focus:ring-purple-500'} rounded-xl text-sm transition-all focus:bg-white`}
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
                          className={`w-full pl-9 pr-4 py-2.5 bg-gray-50 border ${errors.category ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:border-purple-500 focus:ring-purple-500'} rounded-xl text-sm transition-all focus:bg-white`}
                          placeholder="Select or type new category..."
                        />
                        <datalist id="category-suggestions">
                          {categories.map((cat) => (
                            <option key={cat} value={cat} />
                          ))}
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
                          className={`w-full pl-9 pr-4 py-2.5 bg-gray-50 border ${errors.company ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:border-purple-500 focus:ring-purple-500'} rounded-xl text-sm transition-all focus:bg-white`}
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
                          className={`w-full pl-9 pr-4 py-2.5 bg-gray-50 border ${errors.location ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:border-purple-500 focus:ring-purple-500'} rounded-xl text-sm transition-all focus:bg-white`}
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
                          className={`w-full pl-9 pr-4 py-2.5 bg-gray-50 border ${errors.salary ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:border-purple-500 focus:ring-purple-500'} rounded-xl text-sm transition-all focus:bg-white`}
                          placeholder="e.g. 10 - 15"
                        />
                      </div>
                      {errors.salary && <p className="mt-1 text-xs text-red-500 ml-1">{errors.salary.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Job Type</label>
                      <select 
                        {...register("jobtype")}
                        className={`w-full px-4 py-2.5 bg-gray-50 border ${errors.jobtype ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:border-purple-500 focus:ring-purple-500'} rounded-xl text-sm transition-all focus:bg-white`}
                      >
                        <option value="">Select Job Type</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                      </select>
                      {errors.jobtype && <p className="mt-1 text-xs text-red-500 ml-1">{errors.jobtype.message}</p>}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Experience Level</label>
                      <select 
                        {...register("experience")}
                        className={`w-full px-4 py-2.5 bg-gray-50 border ${errors.experience ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:border-purple-500 focus:ring-purple-500'} rounded-xl text-sm transition-all focus:bg-white`}
                      >
                        <option value="">Select Experience</option>
                        <option value="Fresher">Fresher (0-1 years)</option>
                        <option value="1-3 Years">1-3 Years</option>
                        <option value="3-5 Years">3-5 Years</option>
                        <option value="5+ Years">5+ Years</option>
                      </select>
                      {errors.experience && <p className="mt-1 text-xs text-red-500 ml-1">{errors.experience.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Job Description</label>
                    <textarea 
                      {...register("description")}
                      rows={6}
                      className={`w-full px-4 py-3 bg-gray-50 border ${errors.description ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:border-purple-500 focus:ring-purple-500'} rounded-xl text-sm transition-all focus:bg-white resize-none`}
                      placeholder="Describe the responsibilities, requirements, and benefits..."
                    ></textarea>
                    {errors.description && <p className="mt-1 text-xs text-red-500 ml-1">{errors.description.message}</p>}
                  </div>

                </form>
              </div>

              <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-white">
                <button 
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  form="create-job-form"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl font-semibold text-white bg-purple-600 hover:bg-purple-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <><Plus size={18} /> Publish Job</>}
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
