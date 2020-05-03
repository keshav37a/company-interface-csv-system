const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
    company:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'companies'
    },
    interview_date:{
        type: Date,
        required: true
    },
    job_profile:{
        type: String,
        required: true
    },
    students:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'students'
    }]   
}, {
    timestamps : true
});

//creating and exporting our schema
const InterviewItem = mongoose.model('interviews', interviewSchema);
module.exports = InterviewItem;