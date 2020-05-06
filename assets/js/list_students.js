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
});


$("#filter-result-select" ).change(function() {
    console.log('on change filter-result called');
    let resultFilterForm = $('#result-filter-form');
    console.log(resultFilterForm.serialize());
    $('#result-filter-form').submit();
});

$("#filter-interview-select" ).change(function() {
    console.log('on change filter-interview called');
    let interviewFilterForm = $('#interview-filter-form');
    console.log(interviewFilterForm.serialize());
    $('#interview-filter-form').submit();
});

$("#filter-batch-select" ).change(function() {
    console.log('on change filter-batch called');
    let interviewFilterForm = $('#batch-filter-form');
    console.log(interviewFilterForm.serialize());
    $('#batch-filter-form').submit();
});


// 