const route = require('express').Router();
const path = require('path');
const Tut = require("../models/Tuteur");
const {Tuteur} = require("../models/Tuteur");

route.get('/', (req, res, next) => {
    Tut.getAll()
      .then((t) => res.status(200).json(t)) 
      .catch((err) => res.status(400).json({ error: err }));
  });

  route.post("/addTuteur", async (req, res, next) => {
    try {
      const tuteur = req.body;
  
      const insertedStudents = await Tuteur.insertMany(tuteur);
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
    
    route.post("/updateTuteur", async (req, res, next) => {
      try {
        const tuteur = req.body;
    
        const promises = tuteur.map(async (item) => {
          const res = await Tuteur.findByIdAndUpdate(item._id, {
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

    route.get('/count',(req,res,next)=>{
      Tut.getAllTeachersCount()
      .then((doc)=>res.status(200).json(doc))
      .catch((err)=>res.status(400).json(err))
    })

    route.delete('/delete/all', (req, res, next) => {
      Tut.deleteAll()
        .then(() => res.status(200).json({ message: 'All tutors deleted' }))
        .catch((err) => res.status(400).json({ error: err.message }));
    });

    route.get('/countBy', async (req, res) => {
      try {
        const tuteurCount = await Tut.getTutorsCountPerSpecialite();
        res.json(tuteurCount);
      } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
      }
    });

    route.post('/search', (req, res, next) => {
      const tuteurEmail = req.body.email;
    
      Tut.searchTuteur(tuteurEmail)
      .then((tuteur)=>res.status(200).json(tuteur))
      .catch((err)=>res.status(400).json(err))
    });

module.exports = route;