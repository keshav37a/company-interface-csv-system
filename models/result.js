const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    student:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'students'
    },
    interview:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'interviews'
    },
    status:{
        type:String,
        required: true
    }
}, {
    timestamps : true
});

//creating and exporting our schema
const ResultItem = mongoose.model('result', resultSchema);
module.exports = ResultItem;