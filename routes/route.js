const route = require('express').Router();
const userModel = require('../models/user');
const path = require('path');




route.post('/register', (req, res, next) => {
  userModel.register(req.body.email, req.body.password)
    .then((user) => res.status(200).json({
      user: user,
      msg: 'User registered successfully'
    }))
    .catch((err) => {
      console.error(err); // Log the error to the console for debugging purposes
      res.status(400).json({ error: err.message }); // Respond with the error message
    });
});


route.post('/login',(req,res,next)=>{
    userModel.login(req.body.email,req.body.password)
    .then((token)=>{res.status(200).json({
        token:token
    })
  })
    .catch((err)=>{res.status(400).json({error:err});});
})

route.post('/resetPwd',(req,res,next)=>{
  userModel.reset(req.body.email)
  .then((user)=>res.status(200).json({
      msg:'Email sent successfully'
  }))
  .catch((err)=>res.status(400).json({error:err}));
}) 

route.put('/updatePassword/:_id',(req,res,next)=>{
  console.log(req.body);
  userModel.updatePassword(req.params._id, req.body.password)
  .then(()=>res.status(200).json({
      msg:'password updated successfully'
  }))
  .catch((err)=>res.status(400).json({error:err}));
});






module.exports = route;