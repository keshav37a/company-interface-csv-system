console.log('new_result_form script called');


$( "#student-select" ).change(function() {
    console.log($(this).val());
    let studentId = $(this).val();
    $.ajax({
        type: 'get',
        url: `/students/${studentId}/dropdown`,
        success: function(data){
            // console.log(data.data);

            //Get only particular company names
            // let interview_scheduled_with_companies = data.interview_scheduled_with_companies;
            let companyArr = [];
            let interviewArr = [];
            if(data.data.batch==undefined){
                interviewArr = data.data;
                console.log(interviewArr);
            }
            else{
                interviewArr = data.data.interview_scheduled_with_companies;
                console.log(interviewArr);
            }

            for(let i=0; i<interviewArr.length; i++){
                let companyObj = interviewArr[i].company;
                companyArr.push(companyObj);
            }
            // console.log(companyArr);
            let selectInput = view(interviewArr);
            $('#interview-select').remove();
            $("#student-select").after(selectInput);
        }, error: function(error){
            console.log(error.responseText);
        }
    })
});

let view = function(interviewArr){
    let initialString = `<select name="interview-name" id="interview-select" class="input-initial" name="interview-name">
    <option value="none">Select Company</option>`;

    let optionString = "";
    for(let i=0; i<interviewArr.length; i++){
        optionString += `<option value="${interviewArr[i]._id}">${interviewArr[i].company.name}</option>`;
    }
    let endString = `</select>`;
    console.log(initialString+optionString+endString);
    return initialString+optionString+endString;
}