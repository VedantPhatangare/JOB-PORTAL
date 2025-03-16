import React, { useEffect, useState } from "react";
import { JobcardProps } from "../../utils/types";
import axios from "axios";
import { Appdispatch, RootState } from "../../app/Store";
import { useDispatch, useSelector } from "react-redux";
import { setJobs } from "../../features/Jobslice";

function JobpostCard({
  _id,
  title,
  company,
  location,
  salary,
  jobtype,
  createdAt,
}: JobcardProps): React.ReactElement {


  const [appl, setappl] = useState<number>(0);

  const jobs = useSelector((state: RootState) => state.jobs.jobs);
  const usedispatch = useDispatch<Appdispatch>()
  const token = localStorage.getItem("token");


  const getApplicantsCount = async () => {
    try {
      let response = await axios.get(
        `http://127.0.0.1:5000/api/application/${_id}/getApplicants`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setappl(response.data.applications.length);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete= async(_id:string)=>{
    console.log(_id);
    
      let Response = await axios.delete(`http://127.0.0.1:5000/api/jobs/deletejob`,{
        data:{id:_id}
      ,
        headers:{
          Authorization: `Bearer ${token}`
        }
      });
      const msg = Response.data.message
      console.log(msg);
      let newJobs = jobs.filter((job)=> job._id != _id)
      usedispatch(setJobs(newJobs))
  }
  useEffect(() => {
    getApplicantsCount();
  }, []);

  return (
    <div className="bg-white rounded-lg p-1 m-1 h-40">
      <h2 className="text-xl font-semibold text-gray-800">
        {jobtype} {title}
      </h2>
      <p className="text-sm text-gray-600">
        {company}-{location}
      </p>
      <span className="text-sm text-gray-600">{salary} lpa</span>

      <div className="text-sm text-gray-600">
        Posted on: {new Date(createdAt as Date).toLocaleString()}
      </div>
      <div>Total Applications: {appl}</div>
      <button
        onClick={()=>handleDelete(_id)}
        className="bg-red-500 text-white rounded-sm px-2 py-1 cursor-pointer text-sm"
      >
        Delete
      </button>
    </div>
  );
}

export default JobpostCard;
