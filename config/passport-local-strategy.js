const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');

console.log('passport local strategy loaded');

//authentication using passport
passport.use(new LocalStrategy({
    usernameField:'email',
    passReqToCallback: true},
    function(req, email, password, done){
        console.log('inside passport.use');
        //find a user and establish an identity
        User.findOne({email:email}, function(err, user){
            if(err){
                // req.flash('error', err);
                return done(err);
            }

            //If user is not found in the db or username incorrect
            if(!user){
                // req.flash('error', 'Incorrect username/password');
                console.log('User does not exist --- Passport.js');
                return done(null, false);
            }

            // If user is found but password incorrect
            if(user.password != password){
                console.log(`User pwd from db- ${user.password} password entered- ${password}`);
                console.log('Incorrect Password --- Passport.js');
                return done(null, false);
            }

            //User found
            console.log('Successful --- Passport.js');
            return done(null, user);
        });
    }
));

//Serializing the user to decide which key is to be kept in the cookies
passport.serializeUser(function(user, done){
    console.log('serialize called');
    done(null, user.id);
});

//Deserialize the user from the key in the cookies
passport.deserializeUser(function(id, done){
    console.log('deserialize called');
    User.findById(id, function(err, user){
        if(err){
            console.log('Error finding user in db while deserilizing --- Passport.js');
            return done(err);
        }
        return done(null, user);
    });
});

//Middleware to check if the user is authenticated
passport.checkAuthentication = function(req, res, next){
    //If the user is authenticated pass on the request to the next function(controller's action)
    if(req.isAuthenticated()){
        console.log('checkAuthentication - authenticated');
        return next();
    }

    //If the user is not signed in
    console.log('checkAuthentication - Not Authenticated');
    return res.redirect('/users/signin');
}

//
passport.setAuthenticatedUser = function(req, res, next){
    if(req.isAuthenticated()){
        //req.user contains the current signed in user from the session cookie and we re just sending this to the locals for the views
        res.locals.user = req.user;
    }
    next();
}

module.exports = passport;