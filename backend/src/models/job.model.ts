import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
   {
        job_id:{
            type: String,
            required:[true,"job id needed to post a job"],
        },
        title:{
            type: String,
            required: [true,"job title needed to post a job"]
        },
        description:{
            type: String,
            required: true
        },
        comapany:{
            type: String,
            required: true
        },
        location:{
            type: String,
            required: true
        },
        salary:{
            type: Number,
            required: true
        },
        jobtype:{
            type: String, enum:["Full-time","Part-time","Contract","Internship"],required: true
        },
        postedBy:{ 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User', 
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