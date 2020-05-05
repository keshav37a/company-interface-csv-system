let dateFormatFn = function(dateString){
    console.log('DateFormat fn called');
    let formattedDate = moment(dateString).format('MMMM DD YYYY');
    return formattedDate;
}

let dates = $(".date");
for(let i=0; i<dates.length; i++){
    console.log(dates[i].innerHTML);
    let unformattedDate = dates[i].innerHTML;
    let formattedDate = dateFormatFn(unformattedDate);
    dates[i].innerHTML = formattedDate;
    console.log(formattedDate);
}


