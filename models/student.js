const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true
    },
    email:{
        type: String,
        unique: true,
        required: true
    },
    batch:{
        type: String,
        required: true
    },
    college:{
        type: String,
        required: true
    },
    courseScore:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'course_score'
    },
    placementStatus:{
        type: String,
        required: true
    },
    interviewScheduledWithCompanies:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'company'
    }],
    selectedInCompanies:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'company'
    }]
}, {
    timestamps : true
});

//creating and exporting our schema
const StudentItem = mongoose.model('student', studentSchema);
module.exports = StudentItem;