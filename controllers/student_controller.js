const Student = require('../models/student');
const CourseScore = require('../models/course_score');

module.exports.home = async function(req, res){
    console.log('student in student_controller called');
    let students = await Student.find();
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


