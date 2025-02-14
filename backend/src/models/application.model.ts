import mongoose,{Schema} from "mongoose";

const applicationSchema = new Schema({
    job_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: [true,"job id needed to apply for a job"],
    },
    applicant_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true,
    },
    status:{
        type: String,
        enum:["Pending","Accepted","Rejected"],
        default: "Pending"
    },
    resume:{
        type: String,
        required: [true,"resume needed to apply for a job"]
    },
    coverletter:{
        type: String
    }
})

const Application = mongoose.model('Application',applicationSchema);
export default Application;
