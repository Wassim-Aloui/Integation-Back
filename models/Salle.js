const mongoose = require("mongoose");




const salleSchema = new mongoose.Schema({
   
        salle: { type: String, required: true }
      
  });

const Salle = mongoose.model("Salle", salleSchema);
var url = process.env.DB_URI;

getAll = () => {
    return new Promise((resolve, reject) => {
      mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }).then(() => {
        Salle.find().lean().then((t) => {
  
      
          resolve(t);
        }).catch((err) => {
          //mongoose.disconnect();
          reject(err);
        });
      }).catch((err) => {
       // mongoose.disconnect();
        reject(err);
      });
    });
  };

  getAllClassesCount = () => {
    return new Promise((resolve, reject) => {
      mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }).then(() => {
        return Salle.countDocuments();
      }).then((count) => {
        resolve(count);
      }).catch((err) => {
        reject(err);
      })
    })
  }


  
   deleteAllSalles = () => {
    return new Promise((resolve, reject) => {
      Salle.deleteMany({})
        .then(() => resolve())
        .catch((err) => reject(err));
    });
  };



  module.exports = {
    Salle,
    getAll,
    getAllClassesCount,
    deleteAllSalles
  

  };
