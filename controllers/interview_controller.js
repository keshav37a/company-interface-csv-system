const Student = require('../models/student');
const Company = require('../models/company');
const Interview = require('../models/interview');

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
        console.log(`${err}`);
        return res.redirect('/students');
    }
    
}

module.exports.createInterviewRequest = async function(req, res){
    try{
        console.log('createInterviewRequest in interview_controller called');
        let company = await Company.findOne({name: req.body['company-name']});
        // console.log(req.body);
        let interview = await Interview.findOne({company:company._id});
        if(interview){
            console.log('interview already exists');
            return res.redirect('back');
        }
        else{
            let studentArrayFromReq = req.body['students'];
            let studentArrayFromDB = [];
            let studentIdFromDB=[];

            if(studentArrayFromReq!=undefined){
                for(let i=0; i<studentArrayFromReq.length; i++){
                    let studentName = studentArrayFromReq[i];
                    let student = await Student.findOne({name: studentName});
                    if(student){
                        studentArrayFromDB.push(student);
                        studentIdFromDB.push(student._id);
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
            return res.redirect('/interviews');
        }
    }
    catch(err){
        console.log(`${err}`);
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
        console.log('home in interview_controller called');
        console.log(req.body);
        console.log(req.params);
        let interviewId = req.params.id;

        let studentIdsPassedInRequest = req.body.students;
        if(!Array.isArray(req.body.students)){
            studentIdsPassedInRequest = [];
            studentIdsPassedInRequest.push(req.body.students);
        }
        
        let interview = await Interview.findById(interviewId).populate("students").exec();
        // console.log(interview);
        console.log(studentIdsPassedInRequest);
        if(interview){
            let studentsPresentlyAllottedToInterview = interview.students;
            let addStudentsArray = [];
            for(let j=0; j<studentIdsPassedInRequest.length; j++){
                let boolFound = false;
                console.log(studentIdsPassedInRequest[j]);
                let reqStudent = await Student.findById(studentIdsPassedInRequest[j]);
                console.log(reqStudent);
                if(reqStudent){
                    let reqStudentName = reqStudent.name;
                    console.log(reqStudentName);
                    for(let i=0; i<studentsPresentlyAllottedToInterview.length; i++){
                        let currentStudentName = studentsPresentlyAllottedToInterview[i].name;
                        if(reqStudentName==currentStudentName){
                            boolFound = true;
                            break;
                        }
                    }
                    if(boolFound==false){
                        let reqStudentId = reqStudent._id;
                        interview.students.push(reqStudentId);
                        await interview.save();
                        addStudentsArray.push(reqStudent);
                    }        
                }
                else{
                    console.log('student not found');
                }
            }

            for(let i=0; i<addStudentsArray.length; i++){
                let student = addStudentsArray[i];
                console.log('in block to add interview to student');
                student.interview_scheduled_with_companies.push(interview);
                await student.save();
            }
            return res.redirect('/interviews');
        }
        else{
            console.log('interview by id not found');
            return res.redirect('/companies');
        }
    }
    catch(err){
        console.log(`${err}`);
        return res.redirect('/companies');
    }
}