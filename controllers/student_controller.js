const Student = require('../models/student');
const CourseScore = require('../models/course_score');
const Interview = require('../models/interview');

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
            return res.redirect('/students');
        }
    }
    catch(err){
        console.log(`${err}`);
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
        let foundStudent = await Student.findById(studentId).populate({path: 'interview_scheduled_with_companies', populate: {path: 'company'}}).populate('selected_in_companies');
        if(foundStudent){
            console.log(foundStudent);
            return res.status(200).json({
                data: foundStudent,
                message: 'student found'
            });    
        }
        else{
            console.log('Student not found');
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
    console.log('home in student_controller called');
    let interviews = await Interview.find({}).populate('company');
    return res.render('new_interview_to_student_form', {title:'interview List', interviews: interviews, studentId:studentId});
}

module.exports.addInterviewToStudentRequest = async function(req, res){
    try{
        console.log('home in student_controller called');
        console.log(req.body);
        console.log(req.params);
        let studentId = req.params.id;

        let interviewIdsPassedInRequest = req.body.interviews;
        if(!Array.isArray(req.body.interviews)){
            interviewIdsPassedInRequest = [];
            interviewIdsPassedInRequest.push(req.body.interviews);
        }
        
        let student = await Student.findById(studentId).populate("interview_scheduled_with_companies").exec();
        // console.log(interview);
        console.log(interviewIdsPassedInRequest);
        if(student){
            let interviewsPresentlyAllottedToStudent = student.interview_scheduled_with_companies;
            let addInterviewsArray = [];
            for(let j=0; j<interviewIdsPassedInRequest.length; j++){
                let boolFound = false;
                console.log(interviewIdsPassedInRequest[j]);
                let reqInterview = await Interview.findById(interviewIdsPassedInRequest[j]).populate('company');
                console.log(reqInterview);
                if(reqInterview){
                    let reqInterviewName = reqInterview.company.name;
                    console.log(reqInterviewName);
                    for(let i=0; i<interviewsPresentlyAllottedToStudent.length; i++){
                        let currentInterviewName = interviewsPresentlyAllottedToStudent[i].company.name;
                        if(reqInterviewName==currentInterviewName){
                            boolFound = true;
                            break;
                        }
                    }
                    if(boolFound==false){
                        let reqInterviewId = reqInterview._id;
                        student.interview_scheduled_with_companies.push(reqInterviewId);
                        await student.save();
                        addInterviewsArray.push(reqInterview);
                    }        
                }
                else{
                    console.log('student not found');
                }
            }

            for(let i=0; i<addInterviewsArray.length; i++){
                let interview = addInterviewsArray[i];
                interview.students.push(studentId);
                await interview.save();
            }
            return res.redirect('/students');
        }
        else{
            console.log('student by id not found');
            return res.redirect('/companies');
        }
    }
    catch(err){
        console.log(`${err}`);
        return res.redirect('/companies');
    }
}