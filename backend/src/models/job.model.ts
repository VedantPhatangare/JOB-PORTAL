import mongoose, { Date, Document,Schema } from "mongoose";

interface jobType extends Document{
  title: string,
  description: string,
  category: string,
  company: string,
  companyLogo?: string,
  location: string,
  salary: number,
  experience: string,
  jobtype: "Full-time"| "Part-time" | "Contract" | "Internship",
  postedBy: {name: string, id: string},
  createdBy:Date,
  applicants: Array<{appl_id:string}>
}

const jobSchema:Schema<jobType> = new mongoose.Schema(
   {
        
        title:{
            type: String,
            required: [true,"job title needed to post a job"]
        },
        description:{
            type: String,
            required: true
        },
        category:{
            type: String,
            required: true
        },
        company:{
            type: String,
            required: true
        },
        companyLogo:{
            type: String
        },
        location:{
            type: String,
            required: true
        },
        salary:{
            type: Number,
            required: true
        },
        experience:{
            type: String,
            required: true
        },
        jobtype:{
            type: String, enum:["Full-time","Part-time","Contract","Internship"],required: true
        },
        postedBy:{ 
            type: Object,
            required: true
        },
        applicants:[{
            type: mongoose.Schema.Types.ObjectId,
            ref:'Application'
        }]
   },
   {
    timestamps: true
   }
)

const Job = mongoose.model('Job',jobSchema);
export default Job;