export interface JobcardProps {
    _id: string, 
    title: string;
    description?: string;
    company: string;
    companyLogo: string;
    location: string;
    salary: string;
    jobtype: string;
    experience: string;
    postedBy: {name:string, id:string};
    createdAt?:Date
  }

  export interface jobPostInput{
    value: string | null | undefined,
    message: string
  }

  export interface jobPostForm{
    title: jobPostInput,
    company: jobPostInput,
    companyLogo?: jobPostInput,
    location: jobPostInput,
    salary: jobPostInput,
    experience: jobPostInput,
    jobtype:jobPostInput ,
    description: jobPostInput
  }

  export interface applicantData{
    job_id: string,
    applicant_id:{
      email:string,
      name: string,
      _id: string
    },
    status:"Pending" | "Accepted" | "Rejected",
    resume:string,
    coverletter?: string,
    createdAt: Date
  }


export interface IApplication {
  job_id: string;
  applicant_id: string;
  status: "Pending" | "Accepted" | "Rejected";
  resume: string;
  coverletter?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

