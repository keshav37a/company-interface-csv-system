const Student = require('../models/student');
const CourseScore = require('../models/course_score');
const Interview = require('../models/interview');
const Result = require('../models/result');
const StatusEnums = require('../config/status_enums');

module.exports.home = async function(req, res){
    console.log('student in student_controller called');
    let students = await Student.find().populate({path: 'interview_scheduled_with_companies', populate: { path: 'company' }});
    return res.render('list_students', {title:'Students List', students: students});
}

module.exports.newStudentRender = function(req, res){
    console.log('student in student_controller called');
    return res.render('new_student_form', {title:'New Student Form'});
}

module.exports.createStudentRequest = async function(req, res){
    try{
        console.log('student in student_controller called');
        console.log(req.body);
        let student = await Student.findOne({email:req.body.email});
        if(student){
            console.log('Student already exists');
            req.flash('error', 'Student already exists');
            return res.redirect('back');
        }
        else{

            let newStudent = await Student.create({
                name: req.body.name,
                email: req.body.email,
                batch: req.body.batch,
                college: req.body.college,
                placement_status: false
            });

            let courseScore = await CourseScore.create({
                data_structures: req.body['course-score-ds'],
                web_development: req.body['course-score-web'],
                react: req.body['course-score-react'],
                student: newStudent._id
            })

            newStudent.course_score = courseScore._id;
            await newStudent.save();
            req.flash('success', 'Student added Successfully');
            return res.redirect('/students');
        }
    }
    catch(err){
        req.flash('error', `Internal Server Error`);
        return res.redirect('/students');
    }
}

module.exports.getDataForDropdown = async function(req, res){
    try{
        console.log('In getDataForDropdown');
        let studentId = req.params.id;
        if(studentId=="none"){
            let interviews = await Interview.find().populate('company');
            console.log('backend: ', interviews);
            return res.status(200).json({
                data: interviews,
                message: 'not found'
            });    
        }
        let foundStudent = await Student.findById(studentId).populate({path: 'interview_scheduled_with_companies', populate: {path: 'company'}}).populate('interview_cleared_with_companies');
        if(foundStudent){
            // console.log(foundStudent);
            return res.status(200).json({
                data: foundStudent,
                message: 'student found'
            });    
        }
        else{
            console.log('Student not found');
            req.flash('error', 'Student not found');
            return res.status(404).json({
                data: -1,
                message: 'student not found'
            });    
        }
    }
    catch(err){
        return res.status(500).json({
            data:-1,
            message: err
        });    
    }
}


module.exports.addInterviewToStudentRender = async function(req, res){
    let studentId = req.params.id;
    console.log('addInterviewToStudentRender in student_controller called');
    let interviews = await Interview.find({}).populate('company');
    return res.render('new_interview_to_student_form', {title:'interview List', interviews: interviews, studentId:studentId});
}

module.exports.addInterviewToStudentRequest = async function(req, res){
    try{
        console.log('req.body');
        console.log(req.body);

        let studentId = req.params.id;
        let interviewIdsReqArr = req.body.interviews;

        if(!Array.isArray(req.body.interviews)){
            interviewIdsReqArr = [];
            interviewIdsReqArr.push(req.body.interviews);
        }

        //Find student from studentId
        let studentObj = await Student.findById(studentId);
        console.log('studentObj');
        if(studentObj){ 
            let allocatedInterviews = studentObj.interview_scheduled_with_companies;
            console.log('allocatedInterviews');
            console.log(allocatedInterviews);

            let isAdded = 0;

            //loop through the interview ids passed to check whether they have already been added or not
            for(let i=0; i<interviewIdsReqArr.length; i++){
                let interviewIdReqObj = interviewIdsReqArr[i];
                let isFound = false;
                //loop through allocated interviews of the student to check whether they have already been added or not
                for(let j=0; j<allocatedInterviews.length; j++){
                    let allocatedInterviewObjId = allocatedInterviews[j];
                    if(interviewIdReqObj.toString()==allocatedInterviewObjId.toString()){
                        isFound = true;
                        console.log(isFound);
                        req.flash('error', 'Interview already added for student');
                        break;
                    }
                }

                //if not found then add
                if(isFound==false){
                    let interviewObj = await Interview.findById(interviewIdReqObj);
                    if(interviewObj){
                        studentObj.interview_scheduled_with_companies.push(interviewIdReqObj);
                        interviewObj.students.push(studentObj._id);
                        await studentObj.save();
                        await interviewObj.save();
                        isAdded++;
                    }
                    else{
                        req.flash('error', `Interview not found`);
                    }
                }
            }
            if(isAdded>0){
                req.flash('success', `${isAdded} Interviews added for ${studentObj.name}`);
            }
            
        }
        else{
            req.flash('error', 'Student not found');
            return res.redirect('back');
        }
        console.log('interviewIdsArr');
        console.log(interviewIdsReqArr);
        return res.redirect('back');
    }
    catch(err){
        console.log(err);
        req.flash('error', 'Internal Server Error');
        return res.redirect('back');
    }
}

module.exports.addResultToStudentWithCompanyRequest = async function(req, res){
    try{
        console.log('addResultToStudentWithCompanyRequest in result_controller called');
        console.log('req.query', req.query);
        console.log('req.body', req.body);
        
        // console.log(req.body);

        let studentId = req.query.sid;
        let interviewId = req.query.iid;

        let boolStudent = false;
        let boolInterview = false;
        //enums mapping has been done in config. Used to get the status from the number
        let resultCode = req.body.result;
        let resultString = StatusEnums[resultCode]; 
        req.body.result = resultString
        // let result = req.body.result;

        let selectedStudent = await Student.findById(studentId);
        if(selectedStudent)
            boolStudent = true;

        let selectedInterview = await Interview.findById(interviewId);
        if(selectedInterview)
            boolInterview = true;

        //If result for that particular interview and student has been added
        let resultsByStudentId = await Result.find({student: selectedStudent._id}).populate('interview');
        console.log('resultsByStudentId', resultsByStudentId);

        for(let i=0; i<resultsByStudentId.length; i++){
            let result = resultsByStudentId[i];
            console.log(result.interview._id);
            console.log(selectedInterview._id);
            if(result.interview._id.toString() == selectedInterview._id.toString()){
                req.flash('error', 'Result for this student and interview have already been added');
                return res.redirect('back');
            }
        }

        console.log(boolStudent);
        console.log(boolInterview);

        if(boolInterview && boolStudent){
            //student me se interview nikal
            console.log('interviewidToBePulled', interviewId);
            await selectedStudent.updateOne({$pull: {'interview_scheduled_with_companies': {$in : [interviewId.toString()]}}});

            //interview me se student nikal
            // await interview.update({$pull: {interviews_scheduled_with_companies: {$in : [interviewId]}}});
            console.log("Both true");

            if(resultString.toLowerCase()=='pass'){
                selectedStudent.interview_cleared_with_companies.push(interviewId);
                selectedStudent.placement_status = true;
            }

            //add items to result
            let newResult = await Result.create({student: selectedStudent._id, interview: selectedInterview._id, status: req.body.result});
            selectedStudent.results.push(newResult);
            await selectedStudent.save();
            

            req.flash('success', 'Result added successfully');
        }
        // console.log(interviews);
        return res.redirect('back');
    }
    catch(err){
        console.log(`${err}`);
        req.flash('error', 'Internal Server Error');
        return res.redirect('back');
    }    

}