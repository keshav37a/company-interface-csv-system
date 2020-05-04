const axios = require('axios');
module.exports.github = async function (req, res) {
    console.log('github in external_controller called');
    try{
        const response = await axios.get('https://jobs.github.com/positions.json?description=python');
        let responseData = response.data;
        let resArr = [];
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
            return res.redirect('/students');
        }
    } 
    catch(error) {
          console.error('error occured');
          return res.redirect('/students');
    }
}
