const Student = require('../models/student');
const Company = require('../models/company');
const Interview = require('../models/interview');
const Result = require('../models/result');

module.exports.home = async function(req, res){
    // console.log('home in interview_controller called');
    let interviews = await Interview.find({}).populate('company').populate('students');
    // console.log(interviews);
    // console.log(interviews[0].students);

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
        req.flash('error', 'Internal Server Error');
        console.log(`${err}`);
        return res.redirect('/students');
    }
    
}

module.exports.createInterviewRequest = async function(req, res){
    try{
        console.log('createInterviewRequest in interview_controller called');
        console.log('req.body', req.body);
        let company = await Company.findById(req.body['company-id']);
        
        //Checking to see if an interview by that company id already exists
        let interview = await Interview.findOne({company:company._id});

        if(interview){
            req.flash('error', 'Interview already exists');
            return res.redirect('back');
        }
        else{
            let studentArrayFromReq = [];
            if(Array.isArray(req.body['students'])){
                studentArrayFromReq = req.body['students'];
            }
            else{
                studentArrayFromReq.push(req.body['students']);
            }

            console.log('studentArrayFromReq', studentArrayFromReq);
            let studentArrayFromDB = [];
            let studentIdFromDB=[];

            //company: company._id,
            //job_profile: req.body['job-profile'],

            if(studentArrayFromReq!=undefined){
                for(let i=0; i<studentArrayFromReq.length; i++){
                    let studentId = studentArrayFromReq[i];
                    let studentObj = await Student.findById(studentId).populate({path: 'results', populate: {path: 'interview', populate: 'company'}});
                    let studentResults = studentObj.results;
                    let toBeAdded = true;
                    for(let i=0; i<studentResults.length; i++){
                        let resultObj = studentResults[i];
                        let interviewObjForThatResult = resultObj.interview;
                        let companyObjForThatInterview = interviewObjForThatResult.company;
                        if(companyObjForThatInterview._id.toString() == company._id.toString()){
                            toBeAdded = false;
                        }
                    }
                    if(studentObj && toBeAdded){
                        console.log('student found in db', studentObj);
                        studentArrayFromDB.push(studentObj);
                        studentIdFromDB.push(studentObj._id);
                    }
                }
            }
        
            // console.log(company);
            let newInterview = await Interview.create({
                company: company._id,
                job_profile: req.body['job-profile'],
                students: studentIdFromDB,
                interview_date: req.body['date']
            });

            // console.log(newInterview);

            for(let i=0; i<studentArrayFromDB.length; i++){
                let student = studentArrayFromDB[i];
                student.interview_scheduled_with_companies.push(newInterview._id);
                await student.save();
            }
            req.flash('success', 'Interview added Successfully');
            return res.redirect('/interviews');
        }
    }
    catch(err){
        console.log(`${err}`);
        req.flash('error', 'Internal server error');
        return res.redirect('/companies');
    }
}


module.exports.addStudentToInterviewRender = async function(req, res){
    let interviewId = req.params.id;
    console.log('home in interview_controller called');
    let students = await Student.find({});
    return res.render('new_student_to_interview_form', {title:'interview List', students: students, interviewId:interviewId});
}

module.exports.addStudentToInterviewRequest = async function(req, res){
    try{
        console.log('addStudentToInterviewRequest in interview_controller called');

        let interviewIdReq = req.params.id;

        let studentIdsReq = req.body.students;

        if(!Array.isArray(req.body.students)){
            studentIdsReq = [];
            studentIdsReq.push(req.body.students);
        }
        
        let interview = await Interview.findById(interviewIdReq);
    
        if(interview){

            let studentsPresentlyAllottedToInterview = interview.students;
            let addStudentIdsArray = [];

            let studFound = 0;
            let studAdded = 0;

            for(let j=0; j<studentIdsReq.length; j++){

                let boolFound = false;
                let reqStudentId = studentIdsReq[j];
                    
                for(let i=0; i<studentsPresentlyAllottedToInterview.length; i++){
                    let currentStudentId = studentsPresentlyAllottedToInterview[i];

                    if(reqStudentId.toString()==currentStudentId.toString()){
                        boolFound = true;
                        studFound++;
                        break;
                    }
                }

                console.log(boolFound);
    
                if(boolFound==false){
                    let student = await Student.findById(reqStudentId);
                    if(student){
                        interview.students.push(reqStudentId);
                        await interview.save();
                        studAdded++;
                        addStudentIdsArray.push(reqStudentId);
                        student.interview_scheduled_with_companies.push(interview);
                        await student.save();
                    }
                }        
            }

            if(studFound>0){
                req.flash('error', `${studFound} students were already added to interview`);
            }

            if(studAdded>0){
                req.flash('success', `${studAdded} students added to interview`);
            }

            return res.redirect('/interviews');
        }
        else{
            req.flash('error', 'Interview not found');
            return res.redirect('/companies');
        }
    }
    catch(err){
        console.log(`${err}`);
        req.flash('error', 'Internal Server Error');
        return res.redirect('/companies');
    }
}