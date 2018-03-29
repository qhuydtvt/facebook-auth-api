var passport = require('passport');

var FacebookTokenStrategy = require('passport-facebook-token');

var User = require('./../models/user');

module.exports = () => {
    passport.use(new FacebookTokenStrategy({
        clientID: "759754417562611",
        clientSecret: "dbf29d470e750d5131ec6169ece05924"
    },
    (accessToken, refreshToken, profile, done) => {
        User.upsert(accessToken, refreshToken, profile, (err, user) => {
            return done(err, user);
        });
    }));
};
