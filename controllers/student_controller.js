module.exports.home = function(req, res){
    console.log('student in student_controller called');
    return res.render('list_students', {title:'Students List'});
}