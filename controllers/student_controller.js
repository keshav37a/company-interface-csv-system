module.exports.student = function(req, res){
    console.log('student in student_controller called');
    return res.send('<h1>Student</h1>');
}