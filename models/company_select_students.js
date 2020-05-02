const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    company:{
        type: String,
        required: true
    },
    students:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'company'
    }],
}, {
    timestamps : true
});

//creating and exporting our schema
const CourseScoreItem = mongoose.model('course_score', companySchema);
module.exports = CourseScoreItem;