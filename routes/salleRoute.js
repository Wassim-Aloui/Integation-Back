const route = require('express').Router();
const path = require('path');
const sa = require("../models/Salle");
const {Salle} = require("../models/Salle");

route.get('/', (req, res, next) => {
    sa.getAll()
      .then((s) => res.status(200).json(s)) 
      .catch((err) => res.status(400).json({ error: err }));
  });

  route.post("/addSalle", async (req, res, next) => {
    try {
      const salle = req.body;
  
      const insertedStudents = await Salle.insertMany(salle);
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
    
    route.post("/updateSalle", async (req, res, next) => {
      try {
        const salle = req.body;
    
        const promises = salle.map(async (item) => {
          const res = await Salle.findByIdAndUpdate(item._id, {
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
      sa.getAllClassesCount()
      .then((doc)=>res.status(200).json(doc))
      .catch((err)=>res.status(400).json(err))
    })

    route.delete('/delete/all', (req, res, next) => {
      sa.deleteAllSalles()
        .then(() => res.status(200).json({ message: 'All classes deleted' }))
        .catch((err) => res.status(400).json({ error: err.message }));
    });

module.exports = route;