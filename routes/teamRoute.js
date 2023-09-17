const route = require('express').Router();
const path = require('path');
const Team = require("../models/Team");
const Student = require("../models/Student");



route.post("/generate", async (req, res) => {
  try {
    const numTeams = req.body.numTeams;
    const maxStudentsPerTeam = 8; 
    const url = process.env.DB_URI; 

    const teams = await Team.createRandomTeams(numTeams, maxStudentsPerTeam, url)
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});


route.get('/count',(req,res,next)=>{
  Team.getAllTeamssCount()
  .then((doc)=>res.status(200).json(doc))
  .catch((err)=>res.status(400).json(err))
})

route.get('/', (req, res, next) => {
  Team.getAll()
    .then((s) => res.status(200).json(s)) 
    .catch((err) => res.status(400).json({ error: err }));
});

route.delete('/:id', (req, res, next) => {
  const teamId = req.params.id;

  Team.deleteTeamById(teamId)
    .then((d) => res.status(200).json({ message: 'Team deleted', d }))
    .catch((err) => res.status(400).json({ error: err.message }));
});


route.delete('/delete/all', (req, res, next) => {
  Team.deleteAll()
    .then(() => res.status(200).json({ message: 'All Teams deleted' }))
    .catch((err) => res.status(400).json({ error: err.message }));
});



route.post('/send',(req,res,next)=>{
  Team.sendAll()
  .then((t)=>res.status(200).json({
      msg:'Email sent successfully'
  }))
  .catch((err)=>res.status(400).json({error:err}));
}) 


module.exports = route;