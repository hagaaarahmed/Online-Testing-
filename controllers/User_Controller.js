function register(user) {
        var mongo = require("mongodb").MongoClient;
        var url = "mongodb://localhost:27017/";
        mongo.connect(url, function (err, db) {
            if (err) throw err;
            var dbo = db.db("online_testing");
            var myobj = {
                name: user.username,
                email: user.email,
                password: user.password,
                phone_number: user.phone,
                cv: user.cv,
                accepted:false
            };
            dbo.collection("user").insertOne( myobj, function (err, result) {
                if (err) throw err;
                db.close();
                console.log("Added")
                return true;
            });
        });
    }

function login(user,fn) {
        var mongo = require("mongodb").MongoClient;
        var url = "mongodb://localhost:27017/";
        mongo.connect(url, function(err, db) {
            if (err) throw err;
            var dbo = db.db("online_testing");
            console.log(user.username)
            dbo.collection("user").findOne({name:user.username,password: user.password}, function (err, result) {

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

function search(search_by,search_about,email ,fn){
    var mongo = require("mongodb").MongoClient;
    var url = "mongodb://localhost:27017/";
    mongo.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("online_testing");
        if(email)
        {
            var myquery={email:search_about};
            dbo.collection("user").find(myquery).toArray(function (err, users) {
                if (err) throw err;
                search_by="user_id"
                search_about=users[0].user_id
            });
        }
        var query;
        if(search_by=="user_id") {
             query = {"user_id": search_about};
        }
        else if(search_by=="type") {
            query = {"type": search_about};
        }
        else if(search_by=="date")
        {
            query = {"date": search_about};
        }

        dbo.collection("exam").find(query).toArray(function (err, exams) {
            if (err) throw err;
            fn(exams)
            db.close();
        });
    });

}

function User_Logout(){}



function View_Examined_Users()
{
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/";
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("online_testing");
        let exam = require('../models/Exam.js');
        var exams=[];
        var myquery={ "solved":true};
        dbo.collection("exam").find(myquery).toArray(function(err,result){
            if (err) throw err;
            console.log(result);
            for (i = 0; i < result.length; i++) {
                exams.push(result[i].user_id);
            }
            let Examined_Users = [...new Set(exams)];
            console.log(Examined_Users);
            let app= require('../app.js');
            app.end4(Examined_Users);
            //console.log("User"+result.exam.user_id+"   "+"Exam ID"+result.exam.id);
            db.close();
        });




    });
}


function View_Cvs(eventEmitter)
{
    var users=[];
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/";
    MongoClient.connect(url, function(err, db) {
        if (err) throw  err;
        var dbo = db.db("online_testing");
        let User = require('../models/User.js');
        collection= dbo.collection('user');
        var myquery = { "accepted": false};
        result =collection.find(myquery).toArray(function(err,item)
        {
            if (err) throw err;
            for (i = 0; i < item.length; i++) {
                user = new User();
            user = item[i];
            users.push(user.name);
            users.push(user.cv);
            console.log(user.name, "    ", user.cv);
        }
            eventEmitter.emit('connection1');
        });
        db.close();
    });
    return users;
}


function View_Cv(eventEmitter,username)
{
    console.log("xxxx");
    let User = require('../models/User.js');
    user = new User();
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/";
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("online_testing");
        let User = require('../models/User.js');
        var myquery = { "name": username};
        dbo.collection("user").findOne(myquery,function(err,item) {
            if (err) throw err;
            console.log(username);
            user = item;
            let app= require('../app.js')
            app.endd(user.cv);
        });
        db.close();
    });

}

module.exports=
    {view_cvs  :function(event){ return View_Cvs(event)},
    view_cv  :function(event,username){ return View_Cv(event,username)},
    view_examined  :function(){ return View_Examined_Users()},
    register  :function(user){ return register(user)},
    login  :function(user , fn){ return login(user,fn)},
    search:function(search_by,search_about,email ,fn){ return search(search_by,search_about,email, fn)}
}