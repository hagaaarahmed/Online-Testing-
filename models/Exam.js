module.exports = class Exam {
    constructor(id = null, type = null, date = null, user_id = null, solved = false, score = 0, questions = [] ){
        this.id = id;
        this.type = type;
        this.date = date;
        this.user_id = user_id;
        this.solved = solved;
        this.score = score;
        this.questions = questions;
    }
}

// // importing another class
// let HR = require('./HR');
// hr = new HR("dalia", "123");
// hr.print();
