const Student = require('../models/student');
const Interview = require('../models/interview');
const Result = require('../models/result');

module.exports.home = async function(req, res){
    console.log('home in result_controller called');
    let results = await Result.find({}).populate({path:'student', populate:{path:'course_score'}}).populate({path: 'interview', populate: { path: 'company' }});
    console.log(results);
    console.log(results[0].interview.company);
    return res.render('list_results', {title: 'results', results: results});
}

module.exports.newResultRender = async function(req, res){
    try{
        console.log('newResultRender in result_controller called');
        let students = await Student.find();
        let interviews = await Interview.find().populate('company');
        console.log(interviews);
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
        console.log(req.body);

        let boolStudent = false;
        let boolInterview = false;

        let studentId = req.body.student;
        let interviewId = req.body['interview-name'];
        let result = req.body.result;

        let selectedStudent = await Student.findById(studentId);
        if(selectedStudent)
            boolStudent = true;

        let selectedInterview = await Interview.findById(interviewId);
        if(selectedInterview)
            boolInterview = true;

        console.log(boolStudent);
        console.log(boolInterview);

        if(boolInterview && boolStudent){
            //student me se interview nikal
            // await selectedStudent.update({$pull: {interviews_scheduled_with_companies: {$in : [interviewId]}}});

            //interview me se student nikal
            // await interview.update({$pull: {interviews_scheduled_with_companies: {$in : [interviewId]}}});
            console.log("Both true");

            selectedStudent.selected_in_companies.push(interviewId);
            if(result.toLowerCase()=='pass'){
                selectedStudent.placement_status = true;
            }
            await selectedStudent.save();

            //add items to result
            let newResult = await Result.create({student: selectedStudent._id, interview: selectedInterview._id, status: result});

        }
        // console.log(interviews);
        return res.render('new_result_form', {title:'New Interview Form', students: students, interviews:interviews});
    }
    catch(err){
        console.log(`${err}`);
        return res.redirect('/students');
    }    
}