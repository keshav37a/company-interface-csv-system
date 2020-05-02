module.exports.user = function(req, res){
    console.log('user in user_controller called');
    return res.send('<h1>User</h1>');
}