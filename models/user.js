var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    firstName: {type: String},
    lastName: {type: String},
    facebookProvider: {
      type: {
        id: String,
        token: String,
        fullName: String
      },
      select: false
    },
    googleProvider: {
        type: {
            id: String,
            token: String,
            fullName: String
        },
        select: false
    }
  });

UserSchema.set('toJSON', {getters: true, virtuals: true});

var UserModel = mongoose.model("user", UserSchema);

UserModel.ggUpsert = (accessToken, refreshToken, profile, cb) => {
    return UserModel.findOne({
        'googleProvider.id': profile.id
    },
    (err, user) => {
        if (!user) {
            var newUser = UserModel({
                googleProvider: {
                    id: profile.id,
                    token: accessToken,
                    fullName: profile.fullName
                }
            });

            newUser.save((err, savedUser) => {
                if (err) {
                    console.log(err);
                }
                cb(err, savedUser); 
            });
        } else {
            return cb(err, user);
        }
    });
};

UserModel.fbUpsert = (accessToken, refreshToken, profile, cb) => {
    return UserModel.findOne({
        'facebookProvider.id': profile.id
    },
    (err, user) => {
       if (!user) {
            var newUser = new UserModel({
               fullName: profile.displayName,
               facebookProvider: {
                   id: profile.id,
                   token: accessToken
               }
           });
           
           newUser.save((err, savedUser) => {
                if (err) {
                    console.log(err, savedUser);
                }
                return cb(err, savedUser);
           });
       } else {  
            return cb(err, user);
       }
    });
}

module.exports = UserModel;