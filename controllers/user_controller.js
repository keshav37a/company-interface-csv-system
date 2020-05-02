module.exports.user = function(req, res){
    console.log('user in user_controller called');
    return res.send('<h1>User</h1>');
}

module.exports.signInRender = function(req, res){
    let title = "sign-in";
    return res.render('sign-in', {title:title});
}

module.exports.signUpRender = function(req, res){
    let title = "sign-up";
    return res.render('sign-up', {title:title});
}