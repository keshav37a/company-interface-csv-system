const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
    company_name:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'company'
    },
    interview_date:{
        type: Date,
        required: true
    },
    students:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student'
    }]   
}, {
    timestamps : true
});

//creating and exporting our schema
const StudentItem = mongoose.model('student', interviewSchema);
module.exports = StudentItem;