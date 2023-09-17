const nodemailer = require('nodemailer');


const transpoter = nodemailer.createTransport({
    service:"Gmail",
    auth:{
        user:process.env.AUTH_EMAIL,
        pass:process.env.AUTH_PASS
    },
});



module.exports.sendResetPassword = (email,cnt)=>{
    transpoter.sendMail({
        from:process.env.AUTH_EMAIL,
        to:email,
        subject:"Password Reset",
        html:`<h1>Password reset link</h1>
        <h2>Hello</h2>
        <p>Click here to reset your password</p>
        ${cnt}`
        
       
    }).catch((err)=>console.log(err));
}


module.exports.send = (email,email1,salet)=>{
    transpoter.sendMail({
        from:process.env.AUTH_EMAIL,
        to: [email, email1],
        subject:"Semaine d'integration",
        html:`<h1>Bonjour Mr / Mdm : </h1>
        <p>Vouz avez invitez d'assistez au salle numéro ${salet}</p>
        `
        
       
    }).catch((err)=>console.log(err));
}






    
