const mongoose = require("mongoose");




const tuteurSchema = new mongoose.Schema({
   
        tuteur: { type: String, required: true },
        departement: { type: String, required: true },
      
  });

const Tuteur = mongoose.model("Tuteur", tuteurSchema);
var url = process.env.DB_URI;

getAll = () => {
    return new Promise((resolve, reject) => {
      mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }).then(() => {
        Tuteur.find().lean().then((t) => {
  
      
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

  getAllTeachersCount = () => {
    return new Promise((resolve, reject) => {
      mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }).then(() => {
        return Tuteur.countDocuments();
      }).then((count) => {
        resolve(count);
      }).catch((err) => {
        reject(err);
      })
    })
  }

  deleteAll = () => {
    return new Promise((resolve, reject) => {
      Tuteur.deleteMany({})
        .then(() => resolve())
        .catch((err) => reject(err));
    });
  };

  getTutorsCountPerSpecialite = () => {
    return new Promise((resolve, reject) => {
      mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }).then(() => {
        Tuteur.aggregate([
          {
            $group: {
              _id: "$departement",
              count: { $sum: 1 }
            }
          }
        ]).then((result) => {
          const tuteurCount = {};
          result.forEach(item => {
            tuteurCount[item._id] = item.count;
          });
          resolve(tuteurCount);
        }).catch((err) => {
          reject(err);
        });
      }).catch((err) => {
        reject(err);
      });
    });
  };

  searchTuteur = (email) => {
    return new Promise((resolve, reject) => {
      mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }).then(() => {
        const filter = { tuteur: email };
        return Tuteur.find(filter);
      }).then((count) => {
        resolve(count);
      }).catch((err) => {
        reject(err);
      })
    })
  }

  module.exports = {
    Tuteur,
    getAll,
    getAllTeachersCount,
    deleteAll,
    getTutorsCountPerSpecialite,
    searchTuteur
  

  };
