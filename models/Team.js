const mongoose = require("mongoose");
const { Student } = require("./Student");
const { Salle } = require("./Salle");
const { Tuteur } = require("./Tuteur");
const { send } = require('../Config/nodemailer');



const teamSchema = new mongoose.Schema({
  salle: { type: String, ref: "Salle" },
  tuteur: { type: String, ref: "Tuteur" },
  students: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
      email: { type: String, ref: "Student" },
      email1: { type: String, ref: "Student" },
      nom: { type: String, ref: "Student" },
      prenom: { type: String, ref: "Student" },
      ci: { type: String, ref: "Student" },
      invited: { type: Boolean, ref: "Student" },
     
    }
  ],
});

const Team = mongoose.model("Team", teamSchema);
var url = process.env.DB_URI;



async function createRandomTeams(numTeams, maxStudentsPerTeam, url) {
  try {
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const allStudents = await Student.find({ haveTeam: false }).lean();
    const allSalles = await Salle.find().lean();
    const allTeachers = await Tuteur.find().lean();
    const teams = await Team.find().lean(); 

    const teacherTeamsCount = {};

    const ciOuiStudents = allStudents.filter(student => student.ci === 'oui');
    const ciNonStudents = allStudents.filter(student => student.ci === 'non');

    // Function to fill teams with students based on priority
    const fillTeamsWithPriority = async (studentsToFill, teamsToFill) => {
      for (const team of teamsToFill) {
        const availableSpace = maxStudentsPerTeam - team.students.length;

        if (availableSpace > 0 && studentsToFill.length > 0) {
          const studentsToAdd = studentsToFill.splice(0, availableSpace);
          for (const student of studentsToAdd) {
            team.students.push(student);
            await Student.updateOne({ _id: student._id }, { $set: { haveTeam: true } });
          }
          await Team.updateOne({ _id: team._id }, { $set: { students: team.students } });
        }
      }
    };

    // Fill existing teams with priority for "oui" students
    await fillTeamsWithPriority(ciOuiStudents, teams.filter(team => team.students.length < maxStudentsPerTeam));

    // Fill existing teams with priority for "non" students
    await fillTeamsWithPriority(ciNonStudents, teams.filter(team => team.students.length < maxStudentsPerTeam));

    // Loop to create new teams and fill existing teams for "oui" students
    while (ciOuiStudents.length >= maxStudentsPerTeam && teams.length < numTeams - 1) {
      let team;

      // Check if there are teams with less than 8 students
      const teamsWithSpace = teams.filter(team => team.students.length < maxStudentsPerTeam);

      if (teamsWithSpace.length > 0) {
        team = teamsWithSpace[0]; // Select the first team with available space
      } else {
        // If no teams have space, create a new team
        team = new Team({
          salle: getRandomSalle(allSalles),
          tuteur: getRandomTeacher(allTeachers),
          students: [],
        });

        await team.save();
        teams.push(team);
      }

      const availableSpace = maxStudentsPerTeam - team.students.length;

      // Prioritize filling teams with "ci" value "oui"
      if (availableSpace > 0 && ciOuiStudents.length > 0) {
        const studentsToAdd = ciOuiStudents.splice(0, availableSpace);
        for (const student of studentsToAdd) {
          team.students.push(student);
          await Student.updateOne({ _id: student._id }, { $set: { haveTeam: true } });
        }
      }

      await Team.updateOne({ _id: team._id }, { $set: { students: team.students } });
    }

    // Loop to create new teams and fill existing teams for "non" students
    while (ciNonStudents.length >= maxStudentsPerTeam && teams.length < numTeams - 1) {
      let team;

      // Check if there are teams with less than 8 students
      const teamsWithSpace = teams.filter(team => team.students.length < maxStudentsPerTeam);

      if (teamsWithSpace.length > 0) {
        team = teamsWithSpace[0]; // Select the first team with available space
      } else {
        // If no teams have space, create a new team
        team = new Team({
          salle: getRandomSalle(allSalles),
          tuteur: getRandomTeacher(allTeachers),
          students: [],
        });

        await team.save();
        teams.push(team);
      }

      const availableSpace = maxStudentsPerTeam - team.students.length;

      // Fill with "ci" value "non"
      if (availableSpace > 0 && ciNonStudents.length > 0) {
        const studentsToAdd = ciNonStudents.splice(0, availableSpace);
        for (const student of studentsToAdd) {
          team.students.push(student);
          await Student.updateOne({ _id: student._id }, { $set: { haveTeam: true } });
        }
      }

      await Team.updateOne({ _id: team._id }, { $set: { students: team.students } });
    }

    // If there are remaining students, create a final team for "oui" students
    if (ciOuiStudents.length > 0) {
      const remainingTeam = new Team({
        salle: getRandomSalle(allSalles),
        tuteur: getRandomTeacher(allTeachers),
        students: ciOuiStudents,
      });

      await Promise.all(ciOuiStudents.map(async student => {
        await Student.updateOne({ _id: student._id }, { $set: { haveTeam: true } });
      }));

      await remainingTeam.save();
      teams.push(remainingTeam);
    }

    // If there are remaining students, create a final team for "non" students
    if (ciNonStudents.length > 0) {
      const remainingTeam = new Team({
        salle: getRandomSalle(allSalles),
        tuteur: getRandomTeacher(allTeachers),
        students: ciNonStudents,
      });

      await Promise.all(ciNonStudents.map(async student => {
        await Student.updateOne({ _id: student._id }, { $set: { haveTeam: true } });
      }));

      await remainingTeam.save();
      teams.push(remainingTeam);
    }

    // Remove teachers with 4 or more teams
    for (const teacher of allTeachers) {
      const teacherId = teacher._id.toString();
      if (teacherTeamsCount[teacherId] && teacherTeamsCount[teacherId] >= 4) {
        const indexToRemove = allTeachers.findIndex(t => t._id.toString() === teacherId);
        if (indexToRemove !== -1) {
          allTeachers.splice(indexToRemove, 1);
        }
      }
    }

    await mongoose.disconnect();

    return teams;
  } catch (error) {
    throw error;
  }
}

function getRandomElements(array, maxElements) {
  const shuffled = array.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(maxElements, shuffled.length));
}
function getRandomSalle(salles) {
  const randomIndex = Math.floor(Math.random() * salles.length);
  return salles[randomIndex].salle;
}
function getRandomTeacher(tuteurs) {
  const randomIndex = Math.floor(Math.random() * tuteurs.length);
  return tuteurs[randomIndex].tuteur;
}




getAllTeamssCount = () => {
  return new Promise((resolve, reject) => {
    mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }).then(() => {
      return Team.countDocuments();
    }).then((count) => {
      resolve(count);
    }).catch((err) => {
      reject(err);
    })
  })
}

getAll = () => {
  return new Promise((resolve, reject) => {
    mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }).then(() => {
      Team.find().lean().then((t) => {


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

deleteTeamById = (id) => {
  return new Promise((resolve, reject) => {
    mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }).then(() => {
      return Team.findByIdAndDelete(id);
    }).then((d) => {
      if (!d) {
        reject(new Error("Team not found"));
        return;
      }
      resolve(d);
    }).catch((err) => {
      reject(err);
    });
  });
};

deleteAll = () => {
  return new Promise((resolve, reject) => {
    Team.deleteMany({})
      .then(() => resolve())
      .catch((err) => reject(err));
  });
};


const sendAll = async () => {
  try {
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const allTeams = await Team.find().populate("students").exec();

    const promises = allTeams.map(async team => {
      const studentsToUpdate = team.students.filter(student => !student.invited);

      if (studentsToUpdate.length > 0) {
        const studentEmails = studentsToUpdate.map(student => [student.email, student.email1]);

        const teamPromises = studentEmails.map(async ([email, email1]) => {
          try {
            const student = team.students.find(
              student => student.email === email || student.email1 === email1
            );
            
            const salet = team.salle; 
            console.log("salle", salet);
            console.log("emalouwt", email);

            send(email, email1 , salet); 
            
            await Team.updateOne(
              { "students.email": email },
              { $set: { "students.$.invited": true } }
            );

            await delay(2000);
          } catch (error) {
            // Handle errors
          }
        });

        await Promise.all(teamPromises);
      }
    });

    await Promise.all(promises);
    mongoose.connection.close();
    return "Reset emails sent to eligible students in all teams, and students have been marked as invited.";
  } catch (err) {
    mongoose.connection.close();
    throw new Error("Error sending reset emails: " + err);
  }
};


module.exports = {
  Team,
  createRandomTeams,
  getAllTeamssCount,
  getAll,
  deleteAll,
  deleteTeamById,
  sendAll,
};