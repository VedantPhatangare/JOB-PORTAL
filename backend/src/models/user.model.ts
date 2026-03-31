import mongoose, { Document, Schema } from "mongoose"
import validator from 'validator'

interface userType extends Document{
  name: string,
  email: string,
  password: string,
  role: "Candidate" | "Recruiter",
  refreshToken?: string,
  appliedJobs: Array<{job_id:string}>,
  postedJobs: Array<{job_id:string}>,
  savedJobs: Array<mongoose.Types.ObjectId>,
  // Candidate profile fields
  skills?: string[],
  bio?: string,
  profilePhoto?: string,
  resumeUrl?: string,
  experience?: string,
  education?: string,
  // Recruiter / Company profile fields
  companyName?: string,
  companyWebsite?: string,
  companyDescription?: string,
  companyLogo?: string,
}

const userSchema:Schema<userType> = new mongoose.Schema(
    {
      name:{
        type:String, 
        required: true
      },
      email:{
        type:String, 
        required: true, 
        unique: [true,"email already exists"],
        validate: validator.default.isEmail
      }, 
      password:{
        type:String,
        required: true
      },
      role:{
        type:String, 
        enum:["Candidate","Recruiter"],
        default: "Candidate",
        required: true
      },
      refreshToken: {
        type: String,
      },
      appliedJobs:
      [{
        type:mongoose.Schema.Types.ObjectId, 
        ref:'Application'
      }],
      postedJobs:[{
        type:mongoose.Schema.Types.ObjectId, 
        ref:'Job'
      }],
      savedJobs:[{
        type:mongoose.Schema.Types.ObjectId, 
        ref:'Job'
      }],
      // Candidate profile fields
      skills: [{ type: String }],
      bio: { type: String },
      profilePhoto: { type: String },
      resumeUrl: { type: String },
      experience: { type: String },
      education: { type: String },
      // Recruiter / Company profile fields
      companyName: { type: String },
      companyWebsite: { type: String },
      companyDescription: { type: String },
      companyLogo: { type: String },
    },
    {timestamps: true}
)

const User = mongoose.model<userType>('User',userSchema);
export default User;
