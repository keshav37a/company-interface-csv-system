module.exports.home = function(req, res){
    console.log('home in home_controller called');
    return res.send('<h1>Home</h1>');
}