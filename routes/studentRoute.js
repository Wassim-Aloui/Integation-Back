const route = require('express').Router();
const {Student} = require('../models/Student');
const path = require('path');
const std = require("../models/Student");



route.post("/addStudent", async (req, res, next) => {
  try {
    
    const students = req.body; 
    const studentIds = students.map(student => student.id);
    const existingStudents = await Student.find({ id: { $in: studentIds } });
    const newStudents = students.filter(student => !existingStudents.some(existing => existing.id === student.id));
    const insertedStudents = await Student.insertMany(newStudents);

    if (insertedStudents) {
      res.status(200).json({ success: true, message: "insert success" });
    } else {
      res.status(400).json({
        success: false,
        message: "insert failed",
      });
    }
  } catch (err) {
    console.error("insert error: ", err);
    res.status(500).json({ success: false, message: "internal_server_error" });
  }
});
  
  route.post("/updateStudent", async (req, res, next) => {
    try {
      const student = req.body;
  
      const promises = student.map(async (item) => {
        const res = await Student.findByIdAndUpdate(item._id, {
          $set: { ...item },
        });
  
        return res;
      });
  
      Promise.all(promises)
        .then(() =>
          res.json({ success: true, message: "update success" })
        )
        .catch((err) => res.status(400).json(err));
    } catch (err) {
      console.error("update error: ", err);
      res.status(500).json({ success: false, message: "internal_server_error" });
    }
  });

  route.get('/', (req, res, next) => {
    std.getAll()
      .then((s) => res.status(200).json(s)) // Send the array directly
      .catch((err) => res.status(400).json({ error: err }));
  });



  route.get('/count',(req,res,next)=>{
    std.getAllStudentsCount()
    .then((doc)=>res.status(200).json(doc))
    .catch((err)=>res.status(400).json(err))
  })


  route.post('/searchId', (req, res, next) => {
    const studentName = req.body.id;
  
    std.search(studentName)
    .then((student)=>res.status(200).json(student))
    .catch((err)=>res.status(400).json(err))
  });


  route.post('/send',(req,res,next)=>{
    std.send(req.body.email)
    .then((s)=>res.status(200).json({
        msg:'Email sent successfully'
    }))
    .catch((err)=>res.status(400).json({error:err}));
  }) 

  route.delete('/:id', (req, res, next) => {
    const studentId = req.params.id;
  
    std.deleteStudentById(studentId)
      .then((deletedStudent) => res.status(200).json({ message: 'Student deleted', deletedStudent }))
      .catch((err) => res.status(400).json({ error: err.message }));
  });

  
  route.delete('/delete/all', (req, res, next) => {
    std.deleteAllStudents()
      .then(() => res.status(200).json({ message: 'All students deleted' }))
      .catch((err) => res.status(400).json({ error: err.message }));
  });

  route.get('/countBySpec', async (req, res) => {
    try {
      const specialiteCounts = await std.getStudentsCountPerSpecialite();
      res.json(specialiteCounts);
    } catch (error) {
      res.status(500).json({ error: 'An error occurred' });
    }
  });

module.exports = route;