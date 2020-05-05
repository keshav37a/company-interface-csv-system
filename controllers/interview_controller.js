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

            if(studentArrayFromReq!=undefined){
                for(let i=0; i<studentArrayFromReq.length; i++){
                    let studentId = studentArrayFromReq[i];
                    let studentObj = await Student.findById(studentId);
                    if(studentObj){
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
                    req.flash('error', 'Student not found');
                    console.log('student not found');
                }
            }

            for(let i=0; i<addStudentsArray.length; i++){
                let student = addStudentsArray[i];
                student.interview_scheduled_with_companies.push(interview);
                await student.save();
            }
            req.flash('success', 'Student added successfully');
            return res.redirect('/interviews');
        }
        else{
            console.log('interview by id not found');
            return res.redirect('/companies');
        }
    }
    catch(err){
        console.log(`${err}`);
        req.flash('error', 'Internal Server Error');
        return res.redirect('/companies');
    }
}