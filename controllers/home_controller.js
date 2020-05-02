module.exports.home = function(req, res){
    const title = "testing variables"
    console.log('home in home_controller called');
    return res.render('home.ejs', {title: title});
}