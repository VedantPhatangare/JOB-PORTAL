import React, { useEffect, useState } from "react";
import { JobcardProps } from "../../utils/types";
import { Appdispatch, RootState } from "../../app/Store";
import { useDispatch, useSelector } from "react-redux";
import { setJobs } from "../../features/Jobslice";
import { useNavigate } from "react-router-dom";
import { deleteJobService, getApplicantsService } from "../../api/services";
import { toast } from "react-toastify";
import { MapPin, Briefcase, IndianRupee, Clock, Users, Trash2, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

function JobpostCard({
  _id,
  title,
  company,
  location,
  salary,
  jobtype,
  createdAt,
}: JobcardProps): React.ReactElement {

  const [applicantCount, setApplicantCount] = useState<number>(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const jobs = useSelector((state: RootState) => state.jobs.jobs);
  const dispatch = useDispatch<Appdispatch>();
  const navigate = useNavigate();

  const getApplicantsCount = async () => {
    try {
      const response = await getApplicantsService(_id);
      if (response.success && response.applications) {
        setApplicantCount(response.applications.length);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this job posting?")) return;
    
    setIsDeleting(true);
    try {
      const response = await deleteJobService(_id);
      if (response.success) {
        toast.success("Job deleted successfully");
        const newJobs = jobs.filter((job) => job._id !== _id);
        dispatch(setJobs(newJobs));
      } else {
        toast.error(response.message || "Failed to delete job");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error deleting job");
    } finally {
      setIsDeleting(false);
    }
  };
  
  useEffect(() => {
    getApplicantsCount();
    // eslint-disable-next-line
  }, [_id]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col h-full group relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary-50 to-transparent rounded-bl-full pointer-events-none opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
      
      <div className="flex justify-between items-start mb-3 relative">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-bold rounded-lg mb-2">
          <Briefcase size={12} /> {jobtype}
        </div>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
          title="Delete Job"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <h2 className="text-lg font-bold text-gray-900 leading-tight mb-1 relative line-clamp-2">
        {title}
      </h2>
      <p className="text-sm font-medium text-gray-600 mb-4 tracking-tight">
        {company}
      </p>

      <div className="space-y-2 mt-auto mb-5 relative">
        <div className="flex items-center text-sm text-gray-500 gap-2">
          <MapPin size={14} className="text-gray-400" /> <span className="truncate">{location}</span>
        </div>
        <div className="flex items-center text-sm text-gray-500 gap-2">
          <IndianRupee size={14} className="text-gray-400" /> <span>{salary} LPA</span>
        </div>
        <div className="flex items-center text-sm text-gray-500 gap-2">
          <Clock size={14} className="text-gray-400" /> <span>{createdAt ? formatDistanceToNow(new Date(createdAt), { addSuffix: true }) : "Recently"}</span>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-auto relative">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
          <div className="bg-blue-50 text-blue-600 p-1.5 rounded-md">
            <Users size={16} />
          </div>
          <span>{applicantCount} applied</span>
        </div>

        <button 
          onClick={() => navigate(`/applications/${_id}`)}
          className="inline-flex items-center gap-1.5 bg-primary-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary-700 transition-colors shadow-sm shadow-primary-500/20 active:scale-95"
        >
          Review <ArrowRight size={14} />
        </button>
      </div>
    </motion.div>
  );
}

export default JobpostCard;
