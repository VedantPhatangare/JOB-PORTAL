import { JobcardProps } from "../../utils/types";
import { FaLocationDot } from "react-icons/fa6";
import { HiCash } from "react-icons/hi";
import { MdArrowForwardIos } from "react-icons/md";
import { useNavigate } from "react-router-dom";
const Jobcard: React.FC<JobcardProps> = ({_id,title,company,location,salary,jobtype,postedBy}) => {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col justify-center items-center w-full h-[25%] rounded-xl bg-gray-50 p-2 mt-2 mb-2  cursor-pointer hover:bg-white transition-all hover:scale-[1.02] shadow-sm"
    onClick={()=>navigate(`/job/:${_id}`)}>
      
      <div className="flex flex-col mb-2 justify-center w-full">
        <div className="flex justify-between text-xl font-medium text-gray-900">
        <p>{title}</p>
        <MdArrowForwardIos className="cursor-pointer fill-green-800 size-5" />
        </div>
        <span className="text-md text-gray-600">{company}</span>
      </div>
      <div className=" mb-2 flex flex-col justify-center w-full">
        <div className="flex items-center gap-2 text-gray-600">
          <FaLocationDot />
          <p>{location}</p>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <HiCash />
          <p>{salary} lpa</p>
        </div>
      </div>

      <div className="flex flex-row gap-4 w-full text-sm items-center">
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md">{jobtype}</span>
        <div className="bg-green-100 text-green-800 px-2 py-1 rounded-md">posted by {postedBy.name}</div>
      </div>

    </div>

  );
};

export default Jobcard;
