let Exam = require('../models/Exam');
let Question = require('../models/Question');
let events = require('events');
let User_Answers = require('../models/User_Answers');
let bodyParser = require('body-parser');
const express = require('express');
let session = require('express-session');
const Question_Controller = require("./Question_Controller");
let MongoClient = require('mongodb').MongoClient;
let url = "mongodb://localhost:27017/";
const app = express();
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(session({secret: 'dalia', resave: true, saveUninitialized: false , cookie:{maxAge:3600000}}));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');


function Generate_Exam(user_name, exam_type) {
    var eventEmitter = new events.EventEmitter();
    var d = new Date();
    var date = d.getDate().toString()+ "/" + (d.getMonth()+1).toString() + "/" + d.getFullYear().toString() ;
   var  new_exam = new Exam(null, exam_type, date, user_name);
   var num_of_questions = 5;
  var  choosen_questions = [];
  var   choosen_indeces = [];
    var questions;
    var get_questions = function Get_Questions() {
        MongoClient.connect(url, {useNewUrlParser: true},function(err, db) {
            if (err) throw err;
            var dbo = db.db("online_testing");
            var query = { related_types: exam_type};
            dbo.collection("question").find( { related_types: exam_type}).toArray(function(err, result) {
                if (err) throw err;
                questions = result;
                eventEmitter.emit('connection1');
                db.close();
            });
        });
    };

    var get_choosen_questions = function Get_Choosen_Questions() {
        for (var i=0; choosen_questions.length < num_of_questions ; i++){
          var  random_index = Math.floor(Math.random() * questions.length);
            if(choosen_indeces.includes(random_index) === false){
                choosen_indeces.push(random_index);
              var  num_of_wrong_answers = 0;
               var  choosen_wrong_answers_indeces = [];
                for(var j=0; num_of_wrong_answers<3; j++){
                  var   random_index_answer = Math.floor(Math.random() * questions[random_index].wrong_answers.length);
                    if(choosen_wrong_answers_indeces.includes(random_index_answer)=== false){
                        choosen_wrong_answers_indeces.push(random_index_answer);
                        num_of_wrong_answers+=1;
                        questions[random_index].wrong_answers[random_index_answer][1] = true;
                    }
                }
                tmp = new Question();
                tmp.convert_to_object(questions[random_index]);
                choosen_questions.push(tmp);

            }
        }
        eventEmitter.emit('connection2');
    };

    var set_exam_questions = function Set_Exam_Questions(){
        new_exam.questions = choosen_questions;
        Save_Exam(new_exam);
    };

    eventEmitter.addListener('connection', get_questions);
    eventEmitter.on('connection1', get_choosen_questions);
    eventEmitter.on('connection2', set_exam_questions);
    eventEmitter.emit('connection');
}

function Generate_Exams(user_name,topics,numofexams)
{

            var exam_types = topics.split(/\s+/);
            console.log(numofexams);
            for(var i = 0;i<numofexams;i++)
            {
                Generate_Exam(user_name, exam_types[i]);
            }
}

function View_Exam(Name)
{
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/";
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("online_testing");
        let exam=require("../models/Exam.js")
        var exams=[];
        var myquery={"solved":true,"user_id":Name};
        dbo.collection("exam").find(myquery).toArray(function(err, result)  {
            if (err) throw err;
            let app= require('../app.js');
            app.endd2(result);
            db.close();
        });
    });
}

function View_Exam_false(Name)
{
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/";
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("online_testing");
        let exam=require("../models/Exam.js")
        var exams=[];
        dbo.collection("exam").find({}, { "user_id":Name,"solved":false }).toArray(function(err, result)  {
            if (err) throw err;
            for(var i=0 ; i<result.length;i++)
            {
                ex=new exam();
                ex=result[i];
                exams.push(ex);
            }
            let app= require('../app.js');
            app.endd2(exams);
            db.close();
        });
    });
}



function Calculate_Exam_Score(exam, answers) {
    calculated_score = 0;
    var eventEmitter = new events.EventEmitter();
    var get_score = function get_score() {
        for(var i=0; i<answers.length; i++){
            if(answers[i] == exam.questions[i].correct_answer){
                calculated_score += 1;
            }
        }
        eventEmitter.emit('connection1');
    };
    var update_score = function update_score(){
        exam.score = calculated_score;
        MongoClient.connect(url, {useNewUrlParser: true},function(err, db) {
            if (err) throw err;
            var dbo = db.db("online_testing");
            var myquery = { _id: exam._id};
            var newvalues = { $set: {score: calculated_score} };
            dbo.collection("exam").updateOne(myquery, newvalues, function(err, res) {
                if (err) throw err;
                console.log("1 document updated");
                db.close();
            });
        });
    };
    eventEmitter.addListener('connection', get_score);
    eventEmitter.on('connection1', update_score);
    eventEmitter.emit('connection');
}

function Calculate_Total_Score(exams) {
    total_score = 0;
    for (var i=0; i<exams.length; i++){
        total_score += exams[i].score;
    }
    return total_score;
}


function Send_Email_To_HR_And_User(username)
{
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/";
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("online_testing");
        let user = require('../models/User');
        var query={"name": username}
        dbo.collection("user").find(query).toArray(function (err,result) {
            if (err) throw err;
            console.log(result);
            let exam = require('../models/Exam');
            var myquery={"user_id": username, "solved": true}
            dbo.collection("exam").find(myquery).toArray(function (err,result1) {
                if (err) throw err;
                var nodemailer = require('nodemailer');
                var smtpTransport = require('nodemailer-smtp-transport');
                process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                var mailAccountUser = 'otesting22@gmail.com';
                var mailAccountPassword = 'online.12';
                var fromEmailAddress = 'otesting22@gmail.com'
                var toEmailAddress = result[0].email;
                var toEmailAddress1='marriiamadham@gmail.com'
                var transport = nodemailer.createTransport(smtpTransport({
                    service: 'gmail',
                    auth: {
                        user: 'otesting22@gmail.com',
                        pass: 'online.12'
                    }
                }))
                var mail = {
                    from: fromEmailAddress,
                    to: toEmailAddress,toEmailAddress1,
                    subject: 'User Information and  Performed Exams',
                    text: 'User Name:' + ' ' + result[0].name + ' '
                        + ',Email:' + ' ' + result[0].email + ' '
                        + ',Password:' + ' ' + result[0].password + ' '
                        + ',CV:' + ' ' + result[0].cv + ' '
                        + ',Accepted:' + ' ' + result[0].accepted + ' '
                        + ',Phone Number:' + ' ' + result[0].phone_number + ' '
                        + ',Performed Exam' + ' ' + result1[0].id + ' '
                        + ',Score' + ' ' + result1[0].score,
                }

                transport.sendMail(mail, function (error, response) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log("Email sent Successfully");
                        console.log(response);
                        transport.close();
                    }

                    transport.close();
                });
            });
        });
    });

}


function  Show_Summarized_Report(user_id)
{
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/";
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("online_testing");
        let exam=require("../models/Exam.js")
        var exams=[];
        var myquery={"user_id": user_id , "solved": true};
        dbo.collection("exam").find(myquery).toArray(function(err, result) {
            if (err) throw err;
            for(var i=0 ; i<result.length;i++)
            {
                console.log('Score For ' + result[i].id + '=' + result[i].score + " ");
                exams.push(result[i]);
            }

            var allScores = Calculate_Total_Score(exams);
            console.log(allScores)
            exams.push(allScores);
            let app= require('../app');
            console.log(exams);
            app.end3(exams);
            db.close();
        });
    }); // using Calculate_Exam_Score()  and Calculate_Total_Score()
}

function Save_Exam(exam) {
    var exam_id;
    var eventEmitter = new events.EventEmitter();
    var save_exam = function save_exam (){
        MongoClient.connect(url, {useNewUrlParser: true}, function(err, db) {
            if (err) throw err;
            var dbo = db.db("online_testing");
            dbo.collection("exam").insertOne(exam, function(err, result) {
                if (err) throw err;
                console.log("1 document inserted");
                exam_id = result.ops[0]._id;
                eventEmitter.emit('connection1');
                db.close();
            });
        });
    };
    var update_exam_id = function update_exam_id(){
        MongoClient.connect(url, {useNewUrlParser: true},function(err, db) {
            if (err) throw err;
            var dbo = db.db("online_testing");
            var myquery = { _id: exam_id};
            var newvalues = { $set: {id: exam_id.toString()} };
            dbo.collection("exam").updateOne(myquery, newvalues, function(err, res) {
                if (err) throw err;
                console.log("1 document updated");
                db.close();
            });
        });
    };
    eventEmitter.addListener('connection', save_exam);
    eventEmitter.on('connection1', update_exam_id);
    eventEmitter.emit('connection');
}

function Change_Exam_To_Solved(exam_id) {
    MongoClient.connect(url, {useNewUrlParser: true},function(err, db) {
        if (err) throw err;
        var dbo = db.db("online_testing");
        var myquery = { _id: exam_id};
        var newvalues = { $set: {"solved": true} };
        dbo.collection("exam").updateOne(myquery, newvalues, function(err, res) {
            if (err) throw err;
            console.log("1 document updated");
            db.close();
        });
    });
}


function View_Exams_With_Solutions(exam_id)
{
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/";
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("online_testing");
        collection= dbo.collection('user_answers');
        let user_exam = require('../models/User_Answers');
        user_ex = new user_exam();
        let exam= require('../models/Exam');
        collection.findOne({"exam.id" : exam_id}, function(err, result) {
            if (err) throw err;
            user_ex=result;
            let app= require('../app');
            console.log(user_ex);
            app.endd1(user_ex);
        });
        db.close();
    });}

function Save_Answers(answers, exam){
    var user_answers = new User_Answers(exam, answers);
    MongoClient.connect(url, {useNewUrlParser: true}, function(err, db) {
        if (err) throw err;
        var dbo = db.db("online_testing");
        dbo.collection("user_answers").insertOne(user_answers, function(err, res) {
            if (err) throw err;
            console.log("1 document inserted");
            db.close();
        });
    });
}

module.exports= {
    viewexamsolution: function (exam_id) {
        return View_Exams_With_Solutions(exam_id)
    },
    viewexam:function (name) {
        return View_Exam(name);
    },
    summarize:function (name) {
        return Show_Summarized_Report(name);
    },
    viewexamfalse:function (name) {
        return View_Exam_false(name);
    },
    Generate_Exams:function (user_name,topics,numofexams) {
        return Generate_Exams(user_name,topics,numofexams);
    },
    Change_Exam_To_Solved :function (exam_id) {
        return Change_Exam_To_Solved(exam_id);
    },
    Calculate_Exam_Score:function (exam, answers) {
        return Calculate_Exam_Score(exam, answers);
    },
    Save_Answers : function (answers, exam){
        return Save_Answers(answers,exam);
    },
    Send_Email_To_HR_And_User:function (username) {
        return Send_Email_To_HR_And_User(username)

    }

}