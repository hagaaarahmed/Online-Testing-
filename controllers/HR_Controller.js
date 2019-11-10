function   HR_Login(hr,fn) {
        var mongo = require("mongodb").MongoClient;
        var url = "mongodb://localhost:27017/";
        mongo.connect(url, function(err, db) {

            if (err) throw err;

            var dbo = db.db("online_testing");
            console.log(hr.username)
            dbo.collection("hr").findOne({name:hr.username,password: hr.password}, function (err, result) {

                if (err) throw err;
                db.close();
                if (result!=null)
                {
                    console.log("true")
                    fn(true)
                }
                else {
                    fn(false)
                }
            });
        });
    }

function Send_Acceptance_Exam(email) {

    var nodemailer = require('nodemailer');
    var smtpTransport = require('nodemailer-smtp-transport');
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    var mailAccountUser = 'otesting22@gmail.com';
    var mailAccountPassword = 'online.12';

    var fromEmailAddress = 'otesting22@gmail.com'
    var toEmailAddress = email;

    var transport = nodemailer.createTransport(smtpTransport({
        service: 'gmail',
        auth: {
            user: 'otesting22@gmail.com',
            pass: 'online.12'
        }
    }))

    var mail =
    {
        from: fromEmailAddress,
        to: toEmailAddress,
        subject: "Acceptance Email!",
        text: "Congratulations! You're accepted and there's the link of exams you should solve localhost:3000/login, GOOD LUCK!",
    }

    transport.sendMail(mail, function(error, response){
        if(error){
            console.log(error);
        }else{
            console.log("Message sent");
            console.log(response);
            transport.close();
        }

        transport.close();
    });



}

function Accept_User(username,topics,numofexams)
{
    var email;
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/";
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("online_testing");
        let User = require('../models/User.js');
        var myquery = { "name": username};
          dbo.collection("user").find(myquery).forEach(function(item) {
            if (err) throw err;
              user = new User();
              user = item;
              email=user.email;
             var newvalues = { $set: {"accepted": true , "topics":topics,"numberofexams":numofexams }};
             dbo.collection("user").updateOne(myquery, newvalues, function(err, res) {
                 if (err) throw err;
                 Send_Acceptance_Exam(email);
                 let examcont=require('./Exam_Controller')
                 examcont.Generate_Exams(username,topics,numofexams);
             });
            db.close();
        });
    });
}

function Reject_User(username)
{
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/";

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("online_testing");
        let User = require('../models/User.js');
        var myquery = { "name": username };
        dbo.collection("user").deleteOne(myquery, function(err, obj) {
            if (err) throw err;
            console.log("1 document deleted");
            db.close();
        });
    });
}

module.exports= {acceptuser:function(username,topics,numofexams){ return Accept_User(username,topics,numofexams)},
    rejectuser  :function(username){ return Reject_User(username)},
    login  :function(hr,fn){ return HR_Login(hr,fn)}
}