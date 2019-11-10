/*var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("online_testing");
    let question=require('./models/Question');
        que=new question( id=6,topic = "java", skip = false, mark = false, content = "ssaddffrgf", correct_answer = "ffffff", wrong_anwers = ["lll",["ooo"],["ppp"],["llll"],["mmm"]], related_types = ["java","python"])

    dbo.collection("question").insertOne(que, function(err, res) {
        if (err) throw err;
        console.log("1 document inserted");
        db.close();
    });
});
*/
var events = require('events');
var mongo =require("mongodb").MongoClient;
var url = "mongodb://localhost:27017/";
var express = require('express');
var router = express.Router();
var multer  = require('multer');
var crypto=require('crypto');
var path = require('path')
var storage = multer.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
        crypto.pseudoRandomBytes(16, function (err, raw) {
            if (err) return cb(err)

            cb(null, raw.toString('hex') + path.extname(file.originalname))
        })
    }
})
var upload = multer({ storage: storage });
var app = express();
var session = require('express-session');
var fs =require("fs")
var http = require('http');
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(session({secret:"lolll",resave:false,saveUninitialized:true}))
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');


app.get('/', function (req, res) {
    res.render('index');
});

app.get('/loginuser', (req, res) => {
    res.render('login');
})

app.get('/register', (req, res) => {
    res.render('register');
})

app.get('/Hrlogin', (req, res) =>{
    res.render('HR_login');
})

app.get('/logout',function(req,res) {
    req.session.destroy(function (err) {
        if (err)
        {
            console.log(err);
        }
        else {
            res.render('index');
        }
    });
});

app.post('/hrlogin',function(req,res) {
    var name = req.body.username.toString();
    var password = req.body.Password.toString();
    hr ={username: name,password:password}
   //console.log(user.username)
    let hrControl = require("./controllers/HR_Controller" )
    hrControl.login(hr,function (login){
        if(login== true)
        {
            sess = req.session;
            sess.hr = name;
            res.redirect("/view_cvs")
        }
        else
        {
            res.render("HR_login")
        }
    });

});

app.post('/reg',upload.single('cv'),function (req,res)
{
    var name = req.body.username.toString(),
        email = req.body.Email.toString(),
        pass = req.body.password.toString(),
        phone = req.body.phonenumber.toString();
        cv= './uploads/'+req.file.filename;
        console.log(cv);
        user = {username: name, email: email, password: pass, phone: phone, cv: cv}
        console.log(user.username)
        let userControl = require("./controllers/User_Controller")

        userControl.register(user);
        sess = req.session;
        sess.user = name;
        res.render("index");
    });
app.post('/log',function(req,res){
    var name= req.body.username;
    var password = req.body.Password;
    user={username: name,password:password}
    console.log(user.username)
    let userControl = require("./controllers/User_Controller");
    userControl.login(user,function (login){
        if(login== true)
        {
            sess = req.session;
            sess.user = name;
            res.redirect(307,"/view_exams");
        }
        else
        {
            res.render("register")
        }
    });
});

app.post('/search',function(req,res) {
    var search_by = req.param('search_by');
    var search_value = req.param('value')
    let userConrtol = require("./controllers/User_Controller")
    console.log(search_by);
    var email=false;
    if (search_by == "email") {
        email = true;
    }

    userConrtol.search(search_by, search_value , email, function(result)
    {
        session = req.session;
        userId = session.hr;
        console.log(result);
        res.render("search", {EXAM : result ,userid:userId});
    });
});

app.post('/view_exams', function (request, response) {
    session = request.session;
    userId = session.user;
    var eventEmitter = new events.EventEmitter();
    var exams;
    var get_exams = function Get_Exams() {
        mongo.connect(url, {useNewUrlParser: true},function(err, db) {
            if (err) throw err;
            var dbo = db.db("online_testing");
            var query = { user_id: userId, solved:false };
            dbo.collection("exam").find(query).toArray(function(err, result) {
                if (err) throw err;
                exams = result;
                eventEmitter.emit('connection1');
                db.close();
            });
        });
    };

    var send_to_html = function Send_To_HTML(){
        response.render(__dirname + '/views/User_View_Exams', {exams:exams , userid:userId});
    };
    eventEmitter.addListener('connection', get_exams);
    eventEmitter.on('connection1', send_to_html);
    eventEmitter.emit('connection');
});

function set_session(request){
    request.session.answers = 0;
    request.session.marked_questions = 0;
    request.session.answer1 = undefined;
    request.session.answer2 = undefined;
    request.session.answer3 = undefined;
    request.session.answer4 = undefined;
    request.session.answer5 = undefined;
    request.session.marked1 = undefined;
    request.session.marked2 = undefined;
    request.session.marked3 = undefined;
    request.session.marked4 = undefined;
    request.session.marked5 = undefined;
}

app.post('/view_exam', function (request, response) {
    var exam_id = request.body.exam_id;
    set_session(request);
    var exam;
    var eventEmitter = new events.EventEmitter();
    var get_exam = function Get_Exam(){
        mongo.connect(url, {useNewUrlParser: true},function(err, db) {
            if (err) throw err;
            var dbo = db.db("online_testing");
            var query = { id: exam_id };
            dbo.collection("exam").find(query).toArray(function(err, result) {
                if (err) throw err;
                exam = result[0];
                eventEmitter.emit('connection1');
                db.close();
            });
        });
    };
    var send_to_html = function Send_To_HTML(){
        response.render(__dirname + '/views/View_Exam', {exam:exam, session:request.session});
    };
    eventEmitter.addListener('connection', get_exam);
    eventEmitter.on('connection1', send_to_html);
    eventEmitter.emit('connection');
});

app.post('/submit_exam', function (request, response) {
    var exam_id = request.body.exam_id;
    var exam;
    var eventEmitter = new events.EventEmitter();
    var get_exam = function Get_Exam(){
        mongo.connect(url, {useNewUrlParser: true},function(err, db) {
            if (err) throw err;
            var dbo = db.db("online_testing");
            var query = { id: exam_id };
            dbo.collection("exam").find(query).toArray(function(err, result) {
                if (err) throw err;
                exam = result[0];
                eventEmitter.emit('connection1');
                db.close();
            });
        });
    };
    var answers ;
    var marked_questions;
    let Question_Controller=require('./controllers/Question_Controller')
    let examcont=require('./controllers/Exam_Controller');
    var get_answers = function get_answers(){
        exam.solved = true;
        examcont.Change_Exam_To_Solved(exam._id);
        var marked_question1 = request.session.marked1;
        var marked_question2 = request.session.marked2;
        var marked_question3 = request.session.marked3;
        var marked_question4 = request.session.marked4;
        var marked_question5 = request.session.marked5;
        marked_questions = [marked_question1, marked_question2, marked_question3, marked_question4, marked_question5];
        for(var i=0; i<marked_questions.length; i++){
            if(marked_questions[i] !== undefined){

                Question_Controller.Mark_Question(exam, exam.questions[i]);
            }
        }
        var answer1 = request.session.answer1;
        var answer2 = request.session.answer2;
        var answer3 = request.session.answer3;
        var answer4 = request.session.answer4;
        var answer5 = request.session.answer5;
        answers = [answer1, answer2, answer3, answer4, answer5];
        for( i=0;i<answers.length;i++)
        {
            if(answers[i]=== undefined){
                answers[i] = "";
                Question_Controller.Skip_Question(exam, exam.questions[i]);
            }
        }
        eventEmitter.emit("ready");
    };
    var calculate_score = function calculate_score(){
        examcont.Calculate_Exam_Score(exam, answers);
        eventEmitter.emit('finish');
    };
    var save_answers = function save_answers(){
        response.send(request.session.answers+" "+request.session.marked_questions+" "+ (5-request.session.answers+" "+exam.score));
        examcont.Save_Answers(answers, exam);
        var session = require('express-session');
        session = request.session;
        var username=session.user;
        examcont.Send_Email_To_HR_And_User(username);
    };
    eventEmitter.addListener('connection', get_exam);
    eventEmitter.on('connection1', get_answers);
    eventEmitter.on('ready', calculate_score);
    eventEmitter.on('finish', save_answers);
    eventEmitter.emit('connection');
});

app.post('/save_answer', function (request, response) {
    if(request.body.answer1 != undefined){
        request.session.answer1 = request.body.answer1;
        request.session.answers++;
        response.send();
    }
    else if(request.body.answer2 != undefined){
        request.session.answer2 = request.body.answer2;
        request.session.answers++;
        response.send();
    }
    else if(request.body.answer3 != undefined){
        request.session.answer3 = request.body.answer3;
        request.session.answers++;
        response.send();
    }
    else if(request.body.answer4 != undefined){
        request.session.answer4 = request.body.answer4;
        request.session.answers++;
        response.send();
    }
    else if(request.body.answer5 != undefined){
        request.session.answer5 = request.body.answer5;
        request.session.answers++;
        response.send();
    }
});

app.post('/mark_question', function (request, response) {
    if(request.body.marked1 != undefined){
        request.session.marked1 = request.body.marked1;
        request.session.marked_questions++;
        response.send();
    }
    else if(request.body.marked2 != undefined){
        request.session.marked2 = request.body.marked2;
        request.session.marked_questions++;
        response.send();
    }
    else if(request.body.marked3 != undefined){
        request.session.marked3 = request.body.marked3;
        request.session.marked_questions++;
        response.send();
    }
    else if(request.body.marked4 != undefined){
        request.session.marked4 = request.body.marked4;
        request.session.marked_questions++;
        response.send();
    }
    else if(request.body.marked5 != undefined){
        request.session.marked5 = request.body.marked5;
        request.session.marked_questions++;
        response.send();
    }
});

app.post('/checkUsername',function (req,res) {
    var name = req.body.username
    mongo.connect(url, function(err, db) {

        if (err) throw err;
        var dbo = db.db("online_testing");

        dbo.collection("user").findOne({name:name}, function (err, result) {
            if (err) throw err;
            db.close();
            if (result!=null || name=="") {
                res.send("Not Valid :(")
            }
            else{
                res.send("IT IS A NICE USERNAME :)")
            }
        });
    });
})

app.get('/view_cvs', function (req, res) {

    var eventEmitter = new events.EventEmitter();
    app.set('view engine', 'ejs');
    var users;
    let user_cont = require('./controllers/User_Controller');
    var listner1 = function listner1() {
        users = user_cont.view_cvs(eventEmitter);
    }
    session = req.session;
    userId = session.hr;
    var listner2 = function listner2() { res.render('view_cvs', {user: users ,userid:userId})};
    eventEmitter.addListener('connection', listner1);
    eventEmitter.on('connection1', listner2);
    eventEmitter.emit('connection');
});

app.post('/Accept_user', function (req, res) {
    app.set('view engine','ejs');
    var username=req.param('username1');
    var topics=req.param('topics');
    var numofexams = req.param('numofexams');
    let HR_cont = require('./controllers/HR_Controller');
    HR_cont.acceptuser(username,topics,numofexams);
    res.redirect("/view_cvs");
});

app.post('/Reject_user', function (req, res) {
    app.set('view engine','ejs');
    var username = req.param('username2');
    let HR_cont = require('./controllers/HR_Controller');
    HR_cont.rejectuser(username);
    res.redirect("/view_cvs");
});

app.post('/View_cv', function (req, res) {
    var events = require('events');
    var eventEmitter = new events.EventEmitter();
    app.set('view engine', 'ejs');
    var username = req.param('username');
    let user_cont = require('./controllers/User_Controller');
    var listner1 = function listner1()
    {
        tempfile = user_cont.view_cv(eventEmitter,username);

    }

    module.exports= {endd : function listner2(tempfile)
        {
            console.log(tempfile);
            var fs = require('fs');
            fs.readFile(tempfile, function (err, data) {
                res.contentType("application/pdf");
                res.send(data);
            });
        }
    };
    eventEmitter.addListener('connection2', listner1);
    eventEmitter.emit('connection2');


});

app.post('/view_exam_with_solutions', function (req, res) {
    var events = require('events');
    var eventEmitter = new events.EventEmitter();
    app.set('view engine', 'ejs');
    var exam_id = req.param('username2');
    let exam_cont = require('./controllers/Exam_Controller');
    var listner1 = function listner1()
    {
        exam_cont.viewexamsolution(exam_id);
    }
    module.exports= {endd1 : function view_exam_listner(user_ex) {
            session = req.session;
            userId = session.hr;
            res.render('view_examm', {EXAM: user_ex ,userid:userId });
        }};
    eventEmitter.addListener('connection', listner1);
    eventEmitter.emit('connection');
});

app.post('/exam', function (req, res) {
    var events = require('events');
    var eventEmitter = new events.EventEmitter();
    app.set('view engine', 'ejs');
    var username = req.param('username1');
    let exam_cont = require('./controllers/Exam_Controller');
    var listner1 = function listner1()
    {
        exam_cont.viewexam(username);
    }
    module.exports= {endd2 : function view_exam_listner(view_Exam) {
            session = req.session;
            userId = session.hr;
            res.render('view_exams', {exams: view_Exam ,userid:userId});
        }};
    eventEmitter.addListener('connection', listner1);
    eventEmitter.emit('connection');
});

app.post('/summary', function (req, res) {
    var events = require('events');
    var eventEmitter = new events.EventEmitter();
    app.set('view engine', 'ejs');
    let exam_cont = require('./controllers/Exam_Controller');
    var username = req.param('username2');
    var listner1 = function listner1()
    {
        exam_cont.summarize(username);
    }
    module.exports= {end3 : function view_exam_listner(summarized_report) {
            session = req.session;
            userId = session.hr;
            res.render('summarized_report', {summary: summarized_report ,userid:userId});
            console.log("w b3den");
        }};
    eventEmitter.addListener('connection', listner1);
    eventEmitter.emit('connection');
});

app.get('/view_Examined', function (req, res) {var events = require('events');
    var eventEmitter = new events.EventEmitter();
    app.set('view engine', 'ejs');
    let user_cont = require('./controllers/User_Controller');
    var listner1 = function listner1()
    {
        user_cont.view_examined();
    }
    module.exports= {end4 : function view_exam_listner(examined_users) {
            if (examined_users) {
                session = req.session;
                userId = session.hr;
                res.render('view_examined_users', {examined: examined_users,userid:userId });
                console.log("w b3den");
            }
            else
            {
                res.send('User does not exist...');
            }
        }};
    eventEmitter.addListener('connection', listner1);
    eventEmitter.emit('connection');


});

app.listen(3000, () =>
{
    console.log('zfttt');
});

