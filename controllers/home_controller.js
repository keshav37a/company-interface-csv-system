module.exports.home = function(req, res){
    const title = "testing variables"
    return res.render('home.ejs', {title: title});
}