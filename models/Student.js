const mongoose = require("mongoose");



const studentSchema = new mongoose.Schema({
  id: { type: String, unique : true , required: true },
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  specialite: { type: String, required: true },
  ci: { type: String, required: true },
  email: { type: String, required: true },
  email1: { type: String, required: true },
  haveTeam: { type: Boolean , default:false},
  invited: { type: Boolean , default:false}
 
});

const Student = mongoose.model("Student", studentSchema);
var url = process.env.DB_URI;


 getAll = () => {
  return new Promise((resolve, reject) => {
    mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }).then(() => {
      Student.find().lean().then((std) => {

    
        resolve(std);
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


getAllStudentsCount = () => {
  return new Promise((resolve, reject) => {
    mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }).then(() => {
      return Student.countDocuments();
    }).then((count) => {
      resolve(count);
    }).catch((err) => {
      reject(err);
    })
  })
}


search = (id) => {
  return new Promise((resolve, reject) => {
    mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }).then(() => {
      const filter = { id: id };
      return Student.find(filter);
    }).then((count) => {
      resolve(count);
    }).catch((err) => {
      reject(err);
    })
  })
}


 deleteStudentById = (studentId) => {
  return new Promise((resolve, reject) => {
    mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }).then(() => {
      return Student.findByIdAndDelete(studentId);
    }).then((deletedStudent) => {
      if (!deletedStudent) {
        reject(new Error("Student not found"));
        return;
      }
      resolve(deletedStudent);
    }).catch((err) => {
      reject(err);
    });
  });
};

 deleteAllStudents = () => {
  return new Promise((resolve, reject) => {
    Student.deleteMany({})
      .then(() => resolve())
      .catch((err) => reject(err));
  });
};

getStudentsCountPerSpecialite = () => {
  return new Promise((resolve, reject) => {
    mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }).then(() => {
      Student.aggregate([
        {
          $group: {
            _id: "$specialite",
            count: { $sum: 1 }
          }
        }
      ]).then((result) => {
        const specialiteCounts = {};
        result.forEach(item => {
          specialiteCounts[item._id] = item.count;
        });
        resolve(specialiteCounts);
      }).catch((err) => {
        reject(err);
      });
    }).catch((err) => {
      reject(err);
    });
  });
};

  module.exports = {
    Student,
    getAll,
    getAllStudentsCount,
    deleteStudentById,
    deleteAllStudents,
    getStudentsCountPerSpecialite,
    search

  };
