import { JobcardProps } from "../utils/types";
import { FaLocationDot } from "react-icons/fa6";
import { HiCash } from "react-icons/hi";
import { MdArrowForwardIos } from "react-icons/md";
const Jobcard: React.FC<JobcardProps> = ({
  title,
  description,
  company,
  location,
  salary,
  jobtype,
  postedBy,
}) => {
  return (
    <div className="flex flex-col justify-center items-center w-full h-[25%] rounded-xl bg-white p-2 mt-2 mb-2 font-light text-[#6d6c6c]">
      
      <div className="flex flex-col mb-2 justify-center w-full">
        <div className="flex justify-between text-xl font-semibold text-gray-900">
        <p>{title}</p>
        <MdArrowForwardIos className="cursor-pointer fill-green-800 size-5"/>
        </div>
        <span className="text-md">{company}</span>
      </div>
      <div className=" mb-2 flex flex-col justify-center w-full">
        <div className="flex">
          <FaLocationDot />
          <p>{location}</p>
        </div>
        <div className="flex">
          <HiCash />
          <p>{salary} lpa</p>
        </div>
      </div>

      <div className="flex flex-row gap-4 w-full text-sm text-neutral-950 items-center">
        <span className="bg-gray-200 p-1 rounded-sm">{jobtype}</span>
        <div className="bg-gray-200 p-1 rounded-sm">posted by {postedBy.name}</div>
      </div>

    </div>

  );
};

export default Jobcard;
