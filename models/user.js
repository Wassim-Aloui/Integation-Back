const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {  sendResetPassword } = require('../Config/nodemailer');

const userShcmea = new mongoose.Schema({
  email: { type: String, unique : true , required: true },
  password: { type: String, required: true }
 
});

const User = mongoose.model("User", userShcmea);
var url = process.env.DB_URI;
var privateKey = "this is my secret key testjsdjsbdjdbdjbcjbkajdbqsjq"


register = (email, password) => {
    return new Promise((resolve, reject) => {
      mongoose
        .connect(url, {
          useNewUrlParser: true,
          useUnifiedTopology: true
        })
        .then(() => {
          const characters =
            "123456789abcdefghijklmnopqrstuvwyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
          let activationCode = "";
          for (let i = 0; i < 25; i++) {
            activationCode += characters[Math.floor(Math.random() * characters.length)];
          }
          bcrypt
            .hash(password, 10)
            .then((hashedPassword) => {
              let user = new User({
                email: email,
                password: hashedPassword,
                activationCode: activationCode // Add activationCode field
              });
              user
                .save()
                .then((savedUser) => {
                  mongoose.disconnect();
                  resolve(savedUser);
                })
                .catch((err) => {
                  mongoose.disconnect();
                  reject(err);
                });
            })
            .catch((err) => {
              mongoose.disconnect();
              reject(err);
            });
        })
        .catch((err) => {
          reject(err);
        });
    });
  };

  login = (email, password) => {
    return new Promise((resolve, reject) => {
        mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }).then(() => {
            return User.findOne({ email: email });
        }).then(async (user) => {
            if (user) {
                bcrypt.compare(password, user.password).then((same) => {
                    if (same) {
                        let token = jwt.sign({
                            id: user._id
                        }, privateKey, {
                            expiresIn: '30d',
                        });
                        
                        // Update user's online status and save changes
                        user.isOnline = true;
                        user.save().then(() => {
                            resolve([token, "token", user.role, user.email, user]);
                        }).catch((err) => {
                            reject(err);
                        });

                    } else {
                        const msg = 'Incorrect password'; // Changed from 'err'
                        reject(msg);
                    }
                }).catch((err) => {
                    reject(err);
                });
            } else {
                const msg = 'User not found';
                resolve([msg]);
            }
        }).catch((err) => {
            reject(err);
        });
    });
};

reset=(email)=>{
  return new Promise((resolve,reject)=>{
      mongoose.connect(url,{
          useNewUrlParser: true,
          useUnifiedTopology: true
      }).then(()=>{
          const user = User.findOne({ email: email });
          return user.exec().then((doc)=>{  // add .exec() method call here
              if(doc){
                  console.log(doc._id);  // use doc instead of user
                  const cnt = `http://localhost:3001/reset/${doc._id}`;  // use doc instead of user
                  resolve(sendResetPassword(email,cnt));
                  return true;
              }else{
                  //mongoose.disconnect();
                  reject('Account with this email does not exist');
              }
          });
      });
  });    
}

updatePassword = async (_id, password) => {
  try {
  await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true
  });
  const user = await User.findById(_id);
  if (!user) {
      //mongoose.disconnect();
      throw new Error('User not found');
    }
    console.log(_id);
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);
    user.password = hashedPassword;
    const updatedUser = await user.save();
    //mongoose.disconnect();
    return updatedUser;
  } catch (err) {
    console.log(err);
    //mongoose.disconnect();
    throw new Error('Failed to update password');
  }
  
};

  

  module.exports = {
    User,
    register,
    login,
    reset,
    updatePassword
  };
