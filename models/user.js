
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    firstName: {type: String},
    lastName: {type: String},
    facebookProvider: {
      type: {
        id: String,
        token: String
      },
      select: false
    }
  });

UserSchema.set('toJSON', {getters: true, virtuals: true});

var UserModel = mongoose.model("user", UserSchema);

UserModel.upsert = (accessToken, refreshToken, profile, cb) => {
    var userModel = this;
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