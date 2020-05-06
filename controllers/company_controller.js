const Company = require('../models/company');

module.exports.home = async function (req, res) {
    let companies = await Company.find();
    return res.render('list_companies', { title: 'Company List', companies: companies });
}

//Renders a Form to add a new company
module.exports.newcompanyRender = async function (req, res) {
    return res.render('new_company_form', { title: 'New company Form' });
}

//Request to add a new company in the database
module.exports.createcompanyRequest = async function (req, res) {
    try{
        let company = await Company.findOne({name:req.body.name});

        if(company){
            req.flash('error', 'Company already exists');
            return res.redirect('back');
        }
        else{
            let newCompany = await Company.create({
                name: req.body.name,
                hr_email: req.body.email
            });

            req.flash('success', 'Company added successfully');
            return res.redirect('/companies');
        }
    }
    catch(err){
        console.log(`${err}`);
        req.flash('error', 'Internal Server Error');
        return res.redirect('/back');
    }
}