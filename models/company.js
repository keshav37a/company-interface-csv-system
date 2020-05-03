const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    hr_email:{
        type: String,
        required: true
    }
}, {
    timestamps : true
});

//creating and exporting our schema
const CompanyItem = mongoose.model('companies', companySchema);
module.exports = CompanyItem;