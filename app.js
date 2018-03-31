var createError = require('http-errors');
var express = require('express');
var path = require('path');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var passport = require('passport');

var User = require('./models/user');

var fbLoginConfig = require('./login/fb');

// Load config
var config = require('./config');

// Routers

// Connect database
mongoose.connect(config.database);

// Config facebook login
fbLoginConfig();

var app = express();
app.set('port', process.env.PORT || 7777);

var router = express.Router();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api', (req, res) => {
  res.json({
    "hello": "world"
  });
});

router.route('/health-check').get(function(req, res) {
  res.status(200);
  res.send('Hello World');
});

var createToken = (auth) => {
  return jwt.sign({
    id: auth.id
  }, 'my-secret',
  {
    expiresIn: 60 * 120
  });
}

var generateToken = (req, res, next) => {
  req.token = createToken(req.auth);
  next();
};

var sendToken = (req, res) => {
  res.setHeader('x-auth-token', req.token);
  res.json({
    success: 1,
    message: "Logged in",
    token: req.token
  });
};


router.post(
    "/auth/facebook",
    (req, res, next) => {
      passport.authenticate('facebook-token', function (err, user) {
          if (err) {
            res.json({
              success: 0,
              message: "Authentication problem",
              error: err
            });
          }
          else if(!user) {
            res.json({
              success: 0,
              message: "No such user"
            });
          }
          else {
            req.auth = {
              id: user._id
            };
            next();
          }
      })(req, res, next);
    },
    generateToken, sendToken
);

var authenticate = expressJwt({
  secret: 'my-secret',
  requestProperty: 'auth',
  getToken: (req) => {
    if (req.headers['x-auth-token']) {
      return req.headers['x-auth-token'];
    }
    return null;
  }
});

var getCurrentUser = (req, res, next) => {
  User.findById(req.auth.id, (err, user) => {
    if (err) {
      next(err);
    } else {
      req.user = user;
      next();
    }
  });
};

var getOne = (req, res) => {
  var user = req.user.toObject();
  delete user['facebookProvider'];
  delete user['__v'];
  res.json(user);
};

router.route('/auth/me')
.get(authenticate, getCurrentUser, getOne);


app.use('/api/v1', router);

app.listen(app.get('port'), () => {
  console.log("Listening on port", app.get('port'));
});
