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
  deadline: Date,
  createdBy:Date,
  applicants: Array<{appl_id:string}>,
  skills: string[],
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
        }],
        skills: [{ type: String }],
        deadline: {
            type: Date,
            required: [true, "A deadline is required for the job"]
        }
   },
   {
    timestamps: true
   }
)

// Automatically delete the job document 7 days (604800 seconds) after the deadline passes
jobSchema.index({ deadline: 1 }, { expireAfterSeconds: 604800 });

const Job = mongoose.model('Job',jobSchema);
export default Job;