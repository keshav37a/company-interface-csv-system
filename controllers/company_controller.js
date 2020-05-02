const Company = require('../models/company');
module.exports.home = async function(req, res){
    console.log('home in company_controller called');
    let companies = await Company.find();
    return res.render('list_companies', {title:'Company List', companies: companies});
}

module.exports.newcompanyRender = async function(req, res){
    console.log('company in company_controller called');
    return res.render('new_company_form', {title:'New company Form'});
}

module.exports.createcompanyRequest = async function(req, res){
    try{
        console.log('company in company_controller called');
        console.log(req.body);
        let company = await Company.findOne({email:req.body.email});
        let company2 = await Company.findOne({name:req.body.name});
        if(company || company2){
            console.log('company already exists');
            return res.redirect('back');
        }
        else{

            let newcompany = await Company.create({
                name: req.body.name,
                hr_email: req.body.email,
                job_profile: req.body['job-profile']
            });

            console.log('new company created');
            console.log(newcompany);

            return res.redirect('/companies');
        }
    }
    catch(err){
        console.log(`${err}`);
        return res.redirect('/companies');
    }
}


