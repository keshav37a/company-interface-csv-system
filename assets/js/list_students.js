console.log('students_list script called');

let statuses = $('.status');

statuses.each(function(){
    let el = $(this);
    if(el.text().toLowerCase()=='pass'){
        el.css('color', 'green');
    }
    else if(el.text().toLowerCase()=='fail' || el.text().toLowerCase()=="didn't attempt"){
        el.css('color', 'red');
    }
    else{
        el.css('color', 'blue');
    }
})

// for(let i=0; i<statuses.length; i++){
//     let statusObj = statusObj[i];
//     let statusObjString = statusObj.innerHTML;
//     if(statusObjString.toLowerCase()=='pass'){
//         $(statusObj).css("color", "green");
//     }
// }
// console.log(statuses);