module.exports =  class User {
    constructor(name = null, email = null, password = null, cv = null, accepted = false, phone_number = null, topicsofexam= null , numberofexams = 0 )
    {
        this.name = name;
        this.email = email;
        this.password = password;
        this.cv = cv;
        this.accepted = accepted;
        this.phone_number = phone_number;
        this.topics=topicsofexam;
        this.numberofexams=numberofexams;

    }
};

