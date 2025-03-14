export interface JobcardProps {
    _id: string, 
    title: string;
    description?: string;
    company: string;
    location: string;
    salary: string;
    jobtype: string;
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
    location: jobPostInput,
    salary: jobPostInput,
    jobtype:jobPostInput ,
    description: jobPostInput
  }