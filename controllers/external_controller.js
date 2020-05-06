const axios = require('axios');

//To get job list by hitting an api(github) using axios
module.exports.github = async function (req, res) {
    console.log('github in external_controller called');
    try{
        const response = await axios.get('https://jobs.github.com/positions.json?description=python');
        let responseData = response.data;
        let resArr = [];

        //If the response consists of HTML tags then this removes them
        for(let response of responseData){
            let resObj = response;
            resObj.description = resObj.description
                .replace(/<[^>]+>/gm, '')
                .replace(/&nbsp;/g, ' ')
                .replace(/&rsquo;/, '\'')
                .replace(/(&ldquo;)|(&rdquo;)/g, '"');
            resArr.push(resObj);
        }
        if(responseData){
            return res.render('list_external_github', {jobs:resArr, title:'Github Jobs'});
        }    
        else{
            req.flash('error', 'No response recieved. Please try again later');
            return res.redirect('/students');
        }
    } 
    catch(error) {
          console.error(`${err}`);
          req.flash('error', 'Server error');
          return res.redirect('/students');
    }
}
