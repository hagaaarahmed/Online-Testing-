// Export class
module.exports =  class HR {
    constructor(name = null, password = null){
        this.name = name;
        this.password = password;
    }
    print(){
        console.log(this.name);
        console.log(this.password);
    }
};