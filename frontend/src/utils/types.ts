export interface JobcardProps {
    _id: string, 
    title: string;
    description?: string;
    company: string;
    location: string;
    salary: string;
    jobtype: string;
    postedBy: {name:string, id:string};
  
  }