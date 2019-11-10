function showreg() {
    window.location.href = "register.html";
}
function showlogin() {
    window.location.href = "login.html";
}
function view_CVS(users)
{
    alert("cdecefcvf");
         var empTab = document.getElementById('tab');
         var rowCnt = empTab.rows.length;        // GET TABLE ROW COUNT.
         var tr = empTab.insertRow(rowCnt);
         var td = document.createElement('td');          // TABLE DEFINITION.
         td = tr.insertCell(user.name);
         var td1 = document.createElement('td');          // TABLE DEFINITION.
         td1 = tr.insertCell(user.cv);
         var td2 = document.createElement('td');
         var button=document.createElement('input');
         button.setAttribute('type', 'button');
         button.setAttribute('value', 'Open CV');
       //  button.setAttribute('onclick', 'removeRow(this)');
         td2.appendChild(button);

}

const express=require('express');
var app = express();
var fs=require("fs");
app.get('/' , (req,res)=> {
res.writeHead(200 , {'constent-Type' : 'text/html'});
var homepage=fs.createReadStream(__dirname +'/index.html');
homepage.pipe(res);


})
app.listen(3000,()=>{
    console.log('zfttt');
})
