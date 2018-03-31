var passport = require('passport');
var GoogleTokenStrategy = require( 'passport-google-plus-token');

var User = require('./../models/user');

module.exports = () => {
    passport.use(new GoogleTokenStrategy({
        clientID: "679313125285-3upo68dadbichqerdg41tfr7keel292f.apps.googleusercontent.com",
        clientSecret: "RBmjnZDw6rj8zJwoX-GEtMOB",
        callbackURL: "http://techkids.vn",
        passReqToCallback: true
    },
    (req, accessToken, refreshToken, profile, done) => {
        User.ggUpsert(accessToken, refreshToken, profile, (err, user) => {
            done(err, user);
        });
    }
    ));
}