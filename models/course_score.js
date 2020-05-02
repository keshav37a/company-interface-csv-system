const mongoose = require('mongoose');

const courseScoreSchema = new mongoose.Schema({
    data_structures:{
        type: Number,
        required: true
    },
    web_development:{
        type: Number,
        required: true
    },
    react:{
        type:Number,
        required: true
    },
    student:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student'
    }
}, {
    timestamps : true
});

//creating and exporting our schema
const CourseScoreItem = mongoose.model('course_score', courseScoreSchema);
module.exports = CourseScoreItem;