import React from "react";
import { JobcardProps } from "../../utils/types";
import { MapPin, IndianRupee } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const CompactJobcard: React.FC<JobcardProps> = ({ _id, title, company, location, salary }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 4 }}
      onClick={() => navigate(`/job/${_id}`)}
      className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm cursor-pointer hover:border-primary-200 hover:shadow-md transition-all group"
    >
      <div className="flex gap-3 items-start">
        <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 font-bold text-lg shrink-0 border border-primary-100">
          {company?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-gray-900 group-hover:text-primary-600 transition-colors truncate">
            {title}
          </h4>
          <p className="text-xs text-gray-500 truncate">{company}</p>
          
          <div className="flex items-center gap-3 mt-2 text-[11px] font-medium text-gray-400">
            <span className="flex items-center gap-1">
              <MapPin size={10} /> {location}
            </span>
            <span className="flex items-center gap-1 text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded">
              <IndianRupee size={10} /> {salary} LPA
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CompactJobcard;
