import { useEffect, useState } from "react"
import Jobcard from "../Components/JobCard/Jobcard"
import { JobcardProps } from "../utils/types"
import axios from "axios";
import { useDispatch } from "react-redux";
import { setJobs } from "../features/Jobslice";
import { Appdispatch } from "../app/Store";

const Home:React.FC=()=>{   
    const dispatch = useDispatch<Appdispatch>()
    const [jobs, setjobs] = useState<JobcardProps[]>([]);
    const getJobs = async()=>{
        const response= await axios.get('http://127.0.0.1:5000/api/jobs/getjobs');
        console.log(response);
        setjobs(response.data.jobs);
        dispatch(setJobs(response.data.jobs));
    }
    useEffect(() => {
        getJobs();
    }, [])

  return (
    <div className="relative w-full h-full flex justify-center items-center">
        <div className="w-[70%] h-full flex pt-8">
            <div className="w-[25%] h-full"></div>
            <div className="jobs w-[50%] h-full">
                {
                    jobs?
                    jobs.map((job:JobcardProps)=>
                        <Jobcard key={job._id} {...job}/>
                    )
                    : "No Jobs"
                }
                
            </div>
            <div className="w-[25%] h-full"></div>
        </div>
    </div>
  )
}

export default Home
