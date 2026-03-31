import { JobcardProps } from "../../utils/types";
import { MapPin, IndianRupee, ChevronRight, Briefcase, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow, format } from "date-fns";
import { motion } from "framer-motion";

const Jobcard: React.FC<JobcardProps> = ({ _id, title, company, location, salary, jobtype, postedBy, createdAt, skills, deadline }) => {
  const navigate = useNavigate();

  const isExpired = deadline ? new Date() > new Date(deadline) : false;

  const relativeTime = createdAt
    ? formatDistanceToNow(new Date(createdAt), { addSuffix: true })
    : "Recently";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.75, ease: "easeOut" }}
      onClick={() => !isExpired && navigate(`/job/${_id}`)}
      className={`group relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm
        ${isExpired ? 'opacity-60 grayscale cursor-not-allowed' : 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary-500/10 hover:border-primary-200'}
        transition-[transform,box-shadow,border-color,opacity,filter] duration-800 ease-out will-change-transform`}
    >
      {isExpired && (
        <div className="absolute top-4 right-4 z-10">
          <span className="bg-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border border-red-200 shadow-sm">
            Expired
          </span>
        </div>
      )}
      
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center text-primary-600 font-bold text-xl shadow-inner border border-primary-50 shrink-0">
            {company?.charAt(0).toUpperCase() || "C"}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors duration-150">
              {title}
            </h3>
            <p className="text-sm font-medium text-gray-500 mt-0.5">{company}</p>
          </div>
        </div>
        {!isExpired && (
          <div className="bg-gray-50 p-2 rounded-full group-hover:bg-primary-50 transition-colors duration-150 shrink-0">
            <ChevronRight size={20} className="text-gray-400 group-hover:text-primary-600 transition-colors duration-150" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50/50 p-2 rounded-lg border border-gray-100">
          <MapPin size={16} className="text-gray-400 shrink-0" />
          <span className="truncate">{location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50/50 p-2 rounded-lg border border-gray-100">
          <IndianRupee size={16} className="text-gray-400 shrink-0" />
          <span className="truncate">{salary} LPA</span>
        </div>
      </div>

      {/* Skills tags */}
      {skills && skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {skills.slice(0, 4).map((skill) => (
            <span key={skill} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium border border-gray-200">
              {skill}
            </span>
          ))}
          {skills.length > 4 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
              +{skills.length - 4} more
            </span>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-100">
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-100">
          <Briefcase size={12} /> {jobtype}
        </span>
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
          {relativeTime}
        </span>
        {deadline && (
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
            isExpired ? "bg-red-50 text-red-600 border-red-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"
          }`}>
            <Clock size={12} /> {isExpired ? "Expired" : `Ends on ${format(new Date(deadline), "MMM dd, yyyy")}`}
          </span>
        )}
        <span className="ml-auto text-xs text-gray-400">
          By <span className="font-medium text-gray-500">{postedBy?.name}</span>
        </span>

      </div>
    </motion.div>
  );
};

export default Jobcard;
