const Student = require('../models/student');
const Company = require('../models/company');
const Interview = require('../models/interview');

module.exports.home = async function(req, res){
    console.log('home in interview_controller called');
    // let interviewArr = [];
    let interviews = await Interview.find({}).populate('company').populate('students');
    // for (let i=0; i<interviews.length; i++){
    //     interviewArr[i] = interviews[i];
    //     if(interviews[i].students.length>0){
    //         let studentArr = [];
    //         for(let j=0; j<interviews[i].students.length; j++){
    //             let studentId = interviews[i].students[j];
    //             let student = await Student.findById(studentId);
    //             studentArr.push(student);
    //         }
            
    //         interviewArr[i].students = studentArr;
    //     }
    // }
    console.log(interviews);
    console.log(interviews[0].students);

    return res.render('list_interviews', {title:'interview List', interviews: interviews});
}

module.exports.newInterviewRender = async function(req, res){
    try{
        console.log('newInterviewRender in interview_controller called');
        let students = await Student.find();
        let companies = await Company.find();
        return res.render('new_interview_form', {title:'New Interview Form', students: students, companies:companies});
    }
    catch(err){
        console.log(`${err}`);
        return res.redirect('/students');
    }
    
}

module.exports.createInterviewRequest = async function(req, res){
    try{
        console.log('createInterviewRequest in interview_controller called');
        let company = await Company.findOne({name: req.body['company-name']});
        console.log(req.body);
        let interview = await Interview.findOne({company:company._id});
        if(interview){
            console.log('interview already exists');
            return res.redirect('back');
        }
        else{
            let studentArrayFromReq = req.body['students'];
            let studentArrayFromDB = [];
            let studentIdFromDB=[];

            for(let studentName of studentArrayFromReq){
                let student = await Student.findOne({name: studentName});
                if(student){
                    studentArrayFromDB.push(student);
                    studentIdFromDB.push(student._id);
                }
            }
            console.log(company);
            let newInterview = await Interview.create({
                company: company._id,
                job_profile: req.body['job-profile'],
                students: studentIdFromDB,
                interview_date: req.body['date']
            });

            console.log(newInterview);

            for(let student of studentArrayFromDB){
                student.interview_scheduled_with_companies.push(newInterview._id);
                await student.save();
            }


            // if(newInterview){
                
            // }

            // console.log('new interview created');
            // console.log(newinterview);

            return res.redirect('/interviews');
        }
    }
    catch(err){
        console.log(`${err}`);
        return res.redirect('/companies');
    }
}


