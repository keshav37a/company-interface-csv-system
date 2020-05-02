const User = require('../models/user');

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

module.exports.createUserRequest = async function(req, res){
    console.log(req.body);
    let title = "sign-up";

    if (req.body.password != req.body.confirmPassword) {
        console.log("Passwords do not match");
        return res.redirect('back');
    }
    try {
        //If they do match then check if the user is already registered or not
        let user = await User.findOne({ email: req.body.email });

        //If user entry is not found on the db by email then add the user in the db
        if (!user) {
            let createdUser = await User.create(req.body);
            if (createdUser) {
                console.log('user created successfully');
                return res.redirect('/users/sign-in');
            }
        }
        else {
            console.log('User already exists');
            return res.redirect('back');
        }
    }
    catch (err) {
        console.log(`${err}`);
        return res.redirect('back');
    }
}

module.exports.createSessionRequest = function(req, res){
    console.log(req.body);
    let title = "sign-in";

    return res.render('list_students', {title:title});
}