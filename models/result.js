const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    student:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'students'
    },
    company_name:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'companies'
    },
    status:{
        type:String,
        required: true
    }
}, {
    timestamps : true
});

//creating and exporting our schema
const StudentItem = mongoose.model('student', resultSchema);
module.exports = StudentItem;