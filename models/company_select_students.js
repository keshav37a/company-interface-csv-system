const mongoose = require('mongoose');

const companySelectStudentsSchema = new mongoose.Schema({
    company:{
        type: String,
        required: true
    },
    selected_students:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'students'
    }],
}, {
    timestamps : true
});

//creating and exporting our schema
const CompanySelectStudents = mongoose.model('company_select_students', companySelectStudentsSchema);
module.exports = CompanySelectStudents;