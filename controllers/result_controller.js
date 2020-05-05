const Student = require('../models/student');
const Interview = require('../models/interview');
const Result = require('../models/result');
const { Parser } = require('json2csv');
const moment = require('moment');
const StatusEnums = require('../config/status_enums');

module.exports.home = async function(req, res){
    try{
        console.log('home in result_controller called');
        let results = await Result.find({}).populate({path:'student', populate:{path:'course_score'}}).populate({path: 'interview', populate: { path: 'company' }});
        // console.log(results);
        return res.render('list_results', {title: 'results', results: results});
    }
    catch(err){
        return res.render('/students');
    }
    
}

module.exports.newResultRender = async function(req, res){
    try{
        console.log('newResultRender in result_controller called');
        let students = await Student.find();
        let interviews = await Interview.find().populate('company');
        return res.render('new_result_form', {title:'New Interview Form', students: students, interviews:interviews});
    }
    catch(err){
        console.log(`${err}`);
        return res.redirect('/students');
    }
}

module.exports.createResultRequest = async function(req, res){
    try{
        console.log('createResultRequest in result_controller called');
        // console.log(req.body);

        let boolStudent = false;
        let boolInterview = false;

        let studentId = req.body.student;
        let interviewId = req.body['interview-name'];

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
        console.log(resultsByStudentId);


        console.log(typeof(resultsByStudentId));
        for(let i=0; i<resultsByStudentId.length; i++){
            console.log('in loop');
            let result = resultsByStudentId[i];
            console.log(result.interview._id);
            console.log(selectedInterview._id);
            if(result.interview._id.toString() == selectedInterview._id.toString()){
                console.log('Result for this student and interview have already been added');
                return res.redirect('/results');
            }
        }

        console.log(boolStudent);
        console.log(boolInterview);

        if(boolInterview && boolStudent){
            //student me se interview nikal
            // await selectedStudent.update({$pull: {interviews_scheduled_with_companies: {$in : [interviewId]}}});

            //interview me se student nikal
            // await interview.update({$pull: {interviews_scheduled_with_companies: {$in : [interviewId]}}});
            console.log("Both true");

            selectedStudent.selected_in_companies.push(interviewId);
            if(resultCode.toLowerCase()=='pass'){
                selectedStudent.placement_status = true;
            }
            await selectedStudent.save();

            //add items to result
            let newResult = await Result.create({student: selectedStudent._id, interview: selectedInterview._id, status: req.body.result});

        }
        // console.log(interviews);
        return res.redirect('/results');
    }
    catch(err){
        console.log(`${err}`);
        return res.redirect('/students');
    }    
}

module.exports.exportToCsv = async function(req, res){
    try{
        let results = await Result.find({}).populate({path:'student', populate:{path:'course_score'}}).populate({path: 'interview', populate: { path: 'company' }});    
    
        let resultArr = [];
        for(let i=0; i<results.length; i++){
            let obj = {};
            obj['id'] = results[i].student._id;
            obj['student_name'] = results[i].student.name;
            obj['college'] = results[i].student.college;
            obj['is_placed'] = results[i].student.placement_status;
            obj['ds_scores'] = results[i].student.course_score.data_structures;
            obj['web_dev_scores'] = results[i].student.course_score.web_development;
            obj['react_scores'] = results[i].student.course_score.react;

            let interviewDate = results[i].interview.interview_date;
            interviewDate = (moment(`${interviewDate}`).format('MMMM Do YYYY')).toString();
            obj['interview_date'] = interviewDate;

            obj['company_name'] = results[i].interview.company.name;
            obj['status'] = results[i].status;
            resultArr.push(obj);
        }
    
        // console.log(resultArr);

        const fields = ['id', 'student_name', 'college', 'is_placed', 'ds_scores', 'web_dev_scores',
                        'react_scores', 'interview_date', 'company_name', 'status'];

        const opts = { fields };
        
        const parser = new Parser(opts);
        const csv = parser.parse(resultArr);
        // console.log(csv);
        
        res.attachment('filename.csv');
        res.status(200).send(csv);
    }
    catch(err){
        console.log(err);
        return res.redirect('/results');
    }
    
}