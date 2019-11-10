module.exports = class Question {
    constructor(id = null, topic = null, skip = false, mark = false, content = null, correct_answer = null, wrong_anwers = [], related_types = []){
        this.id = id;
        this.topic = topic;
        this.skip = skip;
        this.mark = mark;
        this.content = content;
        this.correct_answer = correct_answer;
        this.wrong_answers = wrong_anwers;
        this.related_types = related_types;
    }
    convert_to_object(json_object){
        this.id = json_object._id;
        this.topic = json_object.topic;
        this.skip = json_object.skip;
        this.mark = json_object.mark;
        this.content = json_object.content;
        this.correct_answer = json_object.correct_answer;
        var i;
        for(i=0; i<json_object.wrong_answers.length;i++){
            this.wrong_answers.push( json_object.wrong_answers[i]);
        }
        for(i=0; i<json_object.related_types.length;i++){
            this.related_types.push( json_object.related_types[i]);
        }
    }
};