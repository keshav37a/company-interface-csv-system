const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    jobProfile:{
        type: String,
        required: true
    },
}, {
    timestamps : true
});

//creating and exporting our schema
const CourseScoreItem = mongoose.model('course_score', companySchema);
module.exports = CourseScoreItem;