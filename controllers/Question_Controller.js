var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://127.0.0.1:27017/";

function Skip_Question(exam, question){
    MongoClient.connect(url, {useNewUrlParser: true},function(err, db) {
        if (err) throw err;
        var dbo = db.db("online_testing");
        var myquery = { _id: exam._id, "questions.id": question.id};

        var newvalues = { $set: {"questions.$.skip": true} };
        dbo.collection("exam").updateOne(myquery, newvalues, function(err, res) {
            if (err) throw err;
            console.log("1 document updated");
            db.close();
        });
    });
};

function Mark_Question(exam, question) {
    MongoClient.connect(url, {useNewUrlParser: true},function(err, db) {
        if (err) throw err;
        var dbo = db.db("online_testing");
        var myquery = { _id: exam._id, "questions.id": question.id};

        var newvalues = { $set: {"questions.$.mark": true} };
        dbo.collection("exam").updateOne(myquery, newvalues, function(err, res) {
            if (err) throw err;
            console.log("1 document updated");
            db.close();
        });
    });
};



module.exports.Skip_Question = Skip_Question;
module.exports.Mark_Question = Mark_Question;

