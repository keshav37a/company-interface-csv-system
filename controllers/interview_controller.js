const Student = require('../models/student');
const Company = require('../models/company');
const Interview = require('../models/interview');
const Result = require('../models/result');

//To render the page which shows a list of all interviews registered
module.exports.home = async function(req, res){
    let interviews = await Interview.find({}).populate('company').populate('students');
    return res.render('list_interviews', {title:'interview List', interviews: interviews});
}

//To render a page to add a new interview
module.exports.newInterviewRender = async function(req, res){
    try{
        let students = await Student.find();
        let companies = await Company.find();
        return res.render('new_interview_form', {title:'New Interview Form', students: students, companies:companies});
    }
    catch(err){
        req.flash('error', 'Internal Server Error');
        console.log(`${err}`);
        return res.redirect('/students');
    }
    
}

//To request for new interview to be added to the database
module.exports.createInterviewRequest = async function(req, res){
    try{
        let company = await Company.findById(req.body['company-id']);
        
        //Checking to see if an interview by that company id already exists
        let interview = await Interview.findOne({company:company._id});

        if(interview){
            req.flash('error', 'Interview already exists');
            return res.redirect('back');
        }
        else{
            let studentArrayFromReq = [];

            //If the requested body recieved is not an array then make an array and add the single item to it
            if(Array.isArray(req.body['students'])){
                studentArrayFromReq = req.body['students'];
            }
            else{
                studentArrayFromReq.push(req.body['students']);
            }

            let studentArrayFromDB = [];
            let studentIdFromDB=[];

            //If there are also a list of students in the body of the request
            if(studentArrayFromReq!=undefined){
                for(let i=0; i<studentArrayFromReq.length; i++){
                    let studentId = studentArrayFromReq[i];
                    let studentObj = await Student.findById(studentId).populate({path: 'results', populate: {path: 'interview', populate: 'company'}});
                    let studentResults = studentObj.results;
                    let toBeAdded = true;
                    for(let i=0; i<studentResults.length; i++){
                        let resultObj = studentResults[i];
                        let interviewObjForThatResult = resultObj.interview;
                        let companyObjForThatInterview = interviewObjForThatResult.company;

                        //If the student is already allocated to that interview
                        if(companyObjForThatInterview._id.toString() == company._id.toString()){
                            toBeAdded = false;
                        }
                    }

                    //Adding all those students in an array who have been allocated that interview
                    if(studentObj && toBeAdded){
                        studentArrayFromDB.push(studentObj);
                        studentIdFromDB.push(studentObj._id);
                    }
                }
            }
        
            //Creating a new interview obj in database
            let newInterview = await Interview.create({
                company: company._id,
                job_profile: req.body['job-profile'],
                students: studentIdFromDB,
                interview_date: req.body['date']
            });


            //Adding that interview object to the interview_scheduled_with_companies array for all those students who have been allocated that interview
            for(let i=0; i<studentArrayFromDB.length; i++){
                let student = studentArrayFromDB[i];
                student.interview_scheduled_with_companies.push(newInterview._id);
                await student.save();
            }
            req.flash('success', 'Interview added Successfully');
            return res.redirect('/interviews');
        }
    }
    catch(err){
        console.log(`${err}`);
        req.flash('error', 'Internal server error');
        return res.redirect('/companies');
    }
}


//To render a page to add a new student to an existing interview
module.exports.addStudentToInterviewRender = async function(req, res){
    let interviewId = req.params.id;
    console.log('home in interview_controller called');
    let students = await Student.find({});
    return res.render('new_student_to_interview_form', {title:'interview List', students: students, interviewId:interviewId});
}

//To request for new student to be added to the existing interview in the database
module.exports.addStudentToInterviewRequest = async function(req, res){
    try{
        let interviewIdReq = req.params.id;
        let studentIdsReq = req.body.students;

        //If the requested body recieved is not an array then make an array and add the single item to it
        if(!Array.isArray(req.body.students)){
            studentIdsReq = [];
            studentIdsReq.push(req.body.students);
        }
        
        let interview = await Interview.findById(interviewIdReq);

        if(interview){
            let studentsPresentlyAllottedToInterview = interview.students;
            let addStudentIdsArray = [];

            let studFound = 0;
            let studAdded = 0;

            //Iterating through all the student ids passed in the request who have to be added to the interview
            for(let j=0; j<studentIdsReq.length; j++){

                let boolFound = false;
                let reqStudentId = studentIdsReq[j];
                    
                //Iterating through the allocated students of the interview id passed in the request
                for(let i=0; i<studentsPresentlyAllottedToInterview.length; i++){
                    let currentStudentId = studentsPresentlyAllottedToInterview[i];

                    //If any of the students allocated to that interview have the same id as the requested students then they wont be allocated
                    if(reqStudentId.toString()==currentStudentId.toString()){
                        boolFound = true;
                        studFound++;
                        break;
                    }
                }

                console.log(boolFound);
    
                //If the req student did not match with the already allocated students of that interview then add that student to the interview and add that interview to the student
                if(boolFound==false){
                    let student = await Student.findById(reqStudentId);
                    if(student){
                        interview.students.push(reqStudentId);
                        await interview.save();
                        studAdded++;
                        addStudentIdsArray.push(reqStudentId);
                        student.interview_scheduled_with_companies.push(interview);
                        await student.save();
                    }
                }        
            }

            if(studFound>0){
                req.flash('error', `${studFound} students were already added to interview`);
            }

            if(studAdded>0){
                req.flash('success', `${studAdded} students added to interview`);
            }

            return res.redirect('/interviews');
        }
        else{
            req.flash('error', 'Interview not found');
            return res.redirect('/companies');
        }
    }
    catch(err){
        console.log(`${err}`);
        req.flash('error', 'Internal Server Error');
        return res.redirect('/companies');
    }
}