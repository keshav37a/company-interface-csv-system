const Student = require('../models/student');
const CourseScore = require('../models/course_score');
const Interview = require('../models/interview');
const Result = require('../models/result');
const StatusEnums = require('../config/status_enums');
const BatchEnums = require('../config/batch_enums');

module.exports.home = async function(req, res){
    let students = await Student.find().populate({path: 'interview_scheduled_with_companies', populate: { path: 'company' }}).populate({path: 'results', populate: { path: 'interview', populate: {path: 'company'} }});

    //Getting the enum objects and formatting into an array of key value objects to populate the dropdown filter list
    let statusEnumsArr = convertObjToArray(StatusEnums);
    let batchEnumsArr = convertObjToArray(BatchEnums);

    //Passing interviews to populate the filter by interviews dropdown
    let interviews = await Interview.find().populate('company');
    return res.render('list_students', {title:'Students List', students: students, resultStatuses: statusEnumsArr, interviews: interviews, batches: batchEnumsArr});
}

//Render a form to add a new student
module.exports.newStudentRender = function(req, res){
    return res.render('new_student_form', {title:'New Student Form'});
}

//Request to create a new student
module.exports.createStudentRequest = async function(req, res){
    try{
        let student = await Student.findOne({email:req.body.email});
        if(student){
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

//Dynamically populating data for dropdown in the front end by sending the json obj 
module.exports.getDataForDropdown = async function(req, res){
    try{
        console.log('In getDataForDropdown');
        let studentId = req.params.id;

        //Populating the select company option by passing only those names of the companies whose interview has been scheduled
        if(studentId=="none"){
            let interviews = await Interview.find().populate('company');
            return res.status(200).json({
                data: interviews,
                message: 'not found'
            });    
        }
        
        let foundStudent = await Student.findById(studentId).populate({path: 'interview_scheduled_with_companies', populate: {path: 'company'}}).populate('interview_cleared_with_companies');
        if(foundStudent){
            return res.status(200).json({
                data: foundStudent,
                message: 'student found'
            });    
        }
        else{
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

//Render the page to add a new interview to a student
module.exports.addInterviewToStudentRender = async function(req, res){
    let studentId = req.params.id;
    console.log('addInterviewToStudentRender in student_controller called');
    let interviews = await Interview.find({}).populate('company');
    return res.render('new_interview_to_student_form', {title:'interview List', interviews: interviews, studentId:studentId});
}

//Request to allocate an interview to a student
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
        let studentObj = await Student.findById(studentId).populate('results');
        console.log('studentObj', studentObj);
        if(studentObj){ 
            let allocatedInterviews = studentObj.interview_scheduled_with_companies;
            let results = studentObj.results;

            console.log('allocatedInterviews');
            console.log(allocatedInterviews);

            console.log('results');
            console.log(results);

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

                //loop through the results of the student to check if the interview is already present
                for(let j=0; j<results.length; j++){
                    let resultObj = results[j];
                    let interviewObj = resultObj.interview;
                    if(interviewIdReqObj.toString()==interviewObj){
                        isFound = true;
                        console.log(isFound);
                        req.flash('error', 'Result for that interview already added for student');
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
            //Remove interview from students interview scheduled array
            console.log('interviewidToBePulled', interviewId);
            await selectedStudent.updateOne({$pull: {'interview_scheduled_with_companies': {$in : [interviewId.toString()]}}});

            console.log("Both true");

            //If the status is pass then push the interview to selectedStudentInterview
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
        return res.redirect('back');
    }
    catch(err){
        console.log(`${err}`);
        req.flash('error', 'Internal Server Error');
        return res.redirect('back');
    }    

}

//Get student data from filters
module.exports.getFilterData = async function(req, res){
    console.log('getFilterData in getFilterData called');
    console.log(req.body);
    let key = Object.keys(req.body);

    let studArr = [];
    let students = await Student.find().populate({path: 'interview_scheduled_with_companies', populate: { path: 'company' }}).populate({path: 'results', populate: { path: 'interview', populate: {path: 'company'} }});

    if(key[0]=='result'){
        let currentStatus = StatusEnums[req.body['result']];
        console.log('statusEnums[key]["result"]:', currentStatus);
        if(currentStatus==undefined){
            studArr = students;
        }
        else{
            for(let student of students){
                let results = student.results;
                for(let result of results){
                    if(result.status == currentStatus){
                        studArr.push(student);
                    }
                }
            }
        }
        console.log(studArr);
    }
    else if(key[0]=='interview'){
        let interviewId = req.body['interview'];
        if(interviewId=='all'){
            studArr = students;
        }
        else{
            for(let student of students){
                let interviewsScheduled = student.interview_scheduled_with_companies;
                for(let interview of interviewsScheduled){
                    if(interviewId == interview._id){
                        studArr.push(student);
                    }
                }
            }
        }
        console.log(studArr);
    }
    else if(key[0]=='batch'){
        let currentBatch = BatchEnums[req.body['batch']];
        console.log('currentBatch:', currentBatch);
        if(currentBatch=='all'){
            studArr = students;
        }
        else{
            for(let student of students){
                if(student.batch==currentBatch){
                    studArr.push(student);
                }
            }
        }
        console.log(studArr);
    }

    //Getting arrays of name value pairs from enum objects to pass them in the front end to populate the dropdown list
    let statusEnumsArr = convertObjToArray(StatusEnums);
    let batchEnumsArr = convertObjToArray(BatchEnums);
    let interviews = await Interview.find().populate('company');

    return res.render('list_students', 
        {
            title:'Students List', 
            students: studArr, 
            resultStatuses: statusEnumsArr, 
            interviews: interviews, 
            batches: batchEnumsArr
        });
}

//Converting a js object to an array of key value pairs
let convertObjToArray = function(obj){
    let arr = Object.keys(obj).map(function (key) { 
        let value=Number(key);
        let name = obj[key];
        return {name: name, value:value};
    });    
    return arr;
}