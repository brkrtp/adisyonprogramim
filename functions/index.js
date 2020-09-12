const functions = require('firebase-functions');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const admin = require('firebase-admin');
admin.initializeApp();
const firestore = admin.firestore();
let nodemailer

const cors = require('cors')({origin: true});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors);
//app.engine('ejs',engines.handlebars);
app.set('views','./views');
app.set('view engine', 'ejs');


app.get('/', function(req, res) {
    //res.set('Cache-Control','public, max-age=300, s-maxage=600');
    return firestore.collection("blog").get().then(docs=>{
        return res.render('pages/index',{docs:docs.docs});
    }).catch(()=>{
        return res.render('pages/index',{docs:[]});
    });
  
});
// app.get('/:id',function(req,res){
//     return firestore.collection("blog").doc(req.params.id).get().then(doc=>{
//         if(doc.exists){
//             return res.json(doc.data())
//         }
//         return res.status(404).send();
//     }).catch(()=>{
//         return res.status(404).send();
//     });
// })
app.post('/submit',  function(req, res) {
    const {email,phone,name} = req.body
    if(!email || !phone || !name ){
        return res.json({success:false,err:"Bütün alanları doldurun.",body:req.body});
    }else if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)==false){
        return res.json({success:false,err:"Geçersiz email"});
    }else if(phone.length<9 || phone.length>11 || isNaN(parseInt(phone)) || parseInt(phone)<1000000000){
        return res.json({success:false,err:"Geçersiz telefon numarası"});
    }
 
    const nodemailer =  require("nodemailer");
    const transporter = nodemailer.createTransport({
        host: 'smtp.zoho.eu',
        port: 465,
        secure: true, //ssl
        auth: {
                user:'mustafaburakkaratepe@gmail.com',
                pass:'K1llerap**'
        }
    });
    
    return transporter.sendMail({
        from: 'info@restomenum.com',
        to: 'info@restomenum.com',
        subject: "Adisyon-Programim.com Yeni Kayıt",
        html: "Ad:"+name+"<br/>Telefon:"+phone+"<br/>Email:"+email+'<br/>QR:<br/><img src="https://qrcode.tec-it.com/API/QRCode?data=BEGIN%3aVCARD%0d%0aVERSION%3a2.1%0d%0aN%3a'+name+' RM%0d%0aTEL%3bHOME%3bVOICE%3a'+phone+'%0d%0aEND%3aVCARD&backcolor=%23ffffff" height="100" width="100"/>'
    }).then(()=>{
        res.json({success:true});
    }).catch((err)=>{
        res.json({success:false,err:err.response,error:err});
    })
   
});

exports.api = functions.https.onRequest(app);