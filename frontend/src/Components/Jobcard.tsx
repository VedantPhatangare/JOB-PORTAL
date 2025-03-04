import { JobcardProps } from "../utils/types";
import { FaLocationDot } from "react-icons/fa6";
import { HiCash } from "react-icons/hi";
import { MdArrowForwardIos } from "react-icons/md";
import { useNavigate } from "react-router-dom";
const Jobcard: React.FC<JobcardProps> = ({_id,title,company,location,salary,jobtype,postedBy}) => {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col justify-center items-center w-full h-[25%] rounded-xl bg-white p-2 mt-2 mb-2 font-light text-[#6d6c6c]">
      
      <div className="flex flex-col mb-2 justify-center w-full">
        <div className="flex justify-between text-xl font-semibold text-gray-900">
        <p>{title}</p>
        <MdArrowForwardIos className="cursor-pointer fill-green-800 size-5" onClick={()=>navigate(`/job/:${_id}`)}/>
        </div>
        <span className="text-md">{company}</span>
      </div>
      <div className=" mb-2 flex flex-col justify-center w-full">
        <div className="flex items-center gap-2">
          <FaLocationDot />
          <p>{location}</p>
        </div>
        <div className="flex items-center gap-2">
          <HiCash />
          <p>{salary} lpa</p>
        </div>
      </div>

      <div className="flex flex-row gap-4 w-full text-sm items-center">
        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md">{jobtype}</span>
        <div className="bg-green-100 text-black px-2 py-1 rounded-md">posted by {postedBy.name}</div>
      </div>

    </div>

  );
};

export default Jobcard;
