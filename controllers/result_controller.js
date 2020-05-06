const Student = require('../models/student');
const Interview = require('../models/interview');
const Result = require('../models/result');
const { Parser } = require('json2csv');
const moment = require('moment');
const StatusEnums = require('../config/status_enums');

//To render the results list page
module.exports.home = async function(req, res){
    try{
        let results = await Result.find({}).populate({path:'student', populate:{path:'course_score'}}).populate({path: 'interview', populate: { path: 'company' }});
        return res.render('list_results', {title: 'results', results: results});
    }
    catch(err){
        return res.render('/students');
    }
}

//To render the create new result list page
module.exports.newResultRender = async function(req, res){
    try{
        let students = await Student.find();
        let interviews = await Interview.find().populate('company');
        return res.render('new_result_form', {title:'New Interview Form', students: students, interviews:interviews});
    }
    catch(err){
        console.log(`${err}`);
        return res.redirect('/students');
    }
}

//To request for a new result to be added to the db
module.exports.createResultRequest = async function(req, res){
    try{
        
        let boolStudent = false;
        let boolInterview = false;

        let studentId = req.body.student;
        let interviewId = req.body['interview-name'];

        //enums mapping has been done in config. Used to get the result status from the number
        let resultCode = req.body.result;
        let resultString = StatusEnums[resultCode]; 
        req.body.result = resultString
    
        let selectedStudent = await Student.findById(studentId);
        if(selectedStudent)
            boolStudent = true;

        let selectedInterview = await Interview.findById(interviewId);
        if(selectedInterview)
            boolInterview = true;

        //Find results of the requested student 
        let resultsByStudentId = await Result.find({student: selectedStudent._id}).populate('interview');
        
        //Check to see if the result for that interview has already been added or not
        for(let i=0; i<resultsByStudentId.length; i++){
            console.log('in loop');
            let result = resultsByStudentId[i];
            if(result.interview._id.toString() == selectedInterview._id.toString()){
                req.flash('error', 'Result for this student and interview have already been added');
                return res.redirect('back');
            }
        }

        if(boolInterview && boolStudent){
            
            //Remove the interview from the scheduled interview array of the student
            await selectedStudent.updateOne({$pull: {'interview_scheduled_with_companies': {$in : [interviewId.toString()]}}});

            //If the result is pass then add the interview item to the interview cleared array
            if(resultString.toLowerCase()=='pass'){
                selectedStudent.interview_cleared_with_companies.push(interviewId);
                selectedStudent.placement_status = true;
            }

            //create a new result for the student
            let newResult = await Result.create({student: selectedStudent._id, interview: selectedInterview._id, status: req.body.result});
            selectedStudent.results.push(newResult);
            await selectedStudent.save();
            

            req.flash('success', 'Result added successfully');
        }
        return res.redirect('/results');
    }
    catch(err){
        console.log(`${err}`);
        req.flash('error', 'Internal Server Error');
        return res.redirect('/students');
    }    
}

//To export all the results into the csv
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

        const fields = ['id', 'student_name', 'college', 'is_placed', 'ds_scores', 'web_dev_scores',
                        'react_scores', 'interview_date', 'company_name', 'status'];

        const opts = { fields };
        
        //Parsing the object into csv using jsontocsv library
        const parser = new Parser(opts);
        const csv = parser.parse(resultArr);
        
        res.attachment('results.csv');
        res.status(200).send(csv);
    }
    catch(err){
        console.log(err);
        return res.redirect('/results');
    }    
}