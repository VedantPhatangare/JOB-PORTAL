export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: "Candidate" | "Recruiter";
}

export interface LoginPayload {
  email: string;
  password: string;
  role?: "Candidate" | "Recruiter";
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "Candidate" | "Recruiter";
  // Candidate fields
  skills: string[];
  bio: string;
  profilePhoto: string;
  resumeUrl: string;
  experience: string;
  education: string;
  // Recruiter fields
  companyName: string;
  companyWebsite: string;
  companyDescription: string;
  companyLogo: string;
  savedJobs: string[];
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: UserProfile;
}

export interface JobcardProps {
    _id: string; 
    title: string;
    description?: string;
    category?: string;
    company: string;
    companyLogo: string;
    location: string;
    salary: string;
    jobtype: string;
    experience: string;
    postedBy: {name:string, id:string};
    createdAt?: Date;
    skills?: string[];
    deadline?: string;
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
      _id: string,
      skills?: string[],
      bio?: string,
    },
    status:"Pending" | "Shortlisted" | "Accepted" | "Rejected",
    resume:string,
    coverletter?: string,
    matchScore?: number,
    createdAt: Date
  }


export interface IApplication {
  job_id: string;
  applicant_id: string;
  status: "Pending" | "Shortlisted" | "Accepted" | "Rejected";
  resume: string;
  coverletter?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
