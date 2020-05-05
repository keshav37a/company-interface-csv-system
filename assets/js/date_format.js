let dateFormatFn = function(dateString){
    // console.log('DateFormat fn called');
    // console.log(dateString);
    let formattedDate = moment(dateString).format('MMMM DD YYYY');
    return formattedDate;
}

let dates = $(".date");
for(let i=0; i<dates.length; i++){
    // console.log(dates[i].innerHTML);
    let unformattedDate = dates[i].innerHTML;
    // console.log(unformattedDate);
    // console.log(1);
    let formattedDate = dateFormatFn(unformattedDate);
    dates[i].innerHTML = formattedDate;
    // console.log(formattedDate);
}


