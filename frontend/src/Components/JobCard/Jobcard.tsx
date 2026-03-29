import { JobcardProps } from "../../utils/types";
import { MapPin, IndianRupee, ChevronRight, Briefcase, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Jobcard: React.FC<JobcardProps> = ({ _id, title, company, location, salary, jobtype, postedBy }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={() => navigate(`/job/${_id}`)}
      className="group relative bg-white rounded-2xl p-6 cursor-pointer border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary-100 transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center text-primary-600 font-bold text-xl shadow-inner border border-primary-50">
            {company?.charAt(0).toUpperCase() || "C"}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
              {title}
            </h3>
            <p className="text-sm font-medium text-gray-500 mt-0.5">{company}</p>
          </div>
        </div>
        <div className="bg-gray-50 p-2 rounded-full group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
          <ChevronRight size={20} className="text-gray-400 group-hover:text-primary-600 transition-colors" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50/50 p-2 rounded-lg border border-gray-100">
          <MapPin size={16} className="text-gray-400" />
          <span className="truncate">{location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50/50 p-2 rounded-lg border border-gray-100">
          <IndianRupee size={16} className="text-gray-400" />
          <span className="truncate">{salary} LPA</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-100">
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-100">
          <Briefcase size={12} /> {jobtype}
        </span>
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
          <Clock size={12} /> Just posted
        </span>
        <span className="ml-auto text-xs text-gray-400">
          By <span className="font-medium text-gray-500">{postedBy?.name}</span>
        </span>
      </div>
    </motion.div>
  );
};

export default Jobcard;
