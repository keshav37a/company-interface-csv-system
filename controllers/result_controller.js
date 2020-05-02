module.exports.result = function(req, res){
    console.log('result in result_controller called');
    return res.send('<h1>Result</h1>');
}