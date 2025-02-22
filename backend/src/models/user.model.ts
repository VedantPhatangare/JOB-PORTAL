import mongoose, { Document, Schema } from "mongoose"
import validator from 'validator'

interface userType extends Document{
  name: string,
  email: string,
  password: string,
  role: "Candidate" | "Recruiter",
  appliedJobs: Array<{job_id:string}>,
  postedJobs: Array<{job_id:string}>
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
      appliedJobs:
      [{
        type:mongoose.Schema.Types.ObjectId, 
        ref:'Application'
      }],
      postedJobs:[{
        type:mongoose.Schema.Types.ObjectId, 
        ref:'Job'
      }]
    },
    {timestamps: true}
)

const User = mongoose.model<userType>('User',userSchema);
export default User;
