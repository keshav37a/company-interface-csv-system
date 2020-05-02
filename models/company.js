const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    job_profile:{
        type: String,
        required: true
    },
}, {
    timestamps : true
});

//creating and exporting our schema
const CompanyItem = mongoose.model('company', companySchema);
module.exports = CompanyItem;