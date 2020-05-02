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
        ref: 'course_score'
    },
    placement_status:{
        type: String,
        required: true
    },
    interview_scheduled_with_companies:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'company'
    }],
    selected_in_companies:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'company'
    }]
}, {
    timestamps : true
});

//creating and exporting our schema
const StudentItem = mongoose.model('student', studentSchema);
module.exports = StudentItem;