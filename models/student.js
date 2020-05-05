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
    course_score:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'course_scores'
    },
    placement_status:{
        type: String,
        required: true
    },
    interview_scheduled_with_companies:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'interviews'
    }],
    interview_cleared_with_companies:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'interviews'
    }],
    results:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'results'
    }]
}, {
    timestamps : true
});

//creating and exporting our schema
const StudentItem = mongoose.model('students', studentSchema);
module.exports = StudentItem;