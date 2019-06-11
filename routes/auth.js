const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');

// Route for signup
router.post('/signup', (req, res) => {
  // See if the email is already in the db
  User.findOne({email: req.body.email}, (err, user) => {
    // if yes, return an error
    if (user) {
      res.json({type: 'error', message: 'Email already exists'})
    } else {
      // if no, create the user in the db
      let user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
      });
      user.save( (err, user) => {
        if (err) {
          res.json({type: 'error', message: 'Database error creating user'})
        } else {
          // sign a token (this is the login step)
          var token = jwt.sign(user.toObject(), process.env.JWT_SECRET, {
            expiresIn: "1d"
          });
          // return the token
          res.status(200).json({type: 'success', user: user.toObject(), token})
        }
      })
    }
  })
});

// Route for login
router.post('/login', (req, res) => {
  // Find user in db
  User.findOne({email: req.body.email}, (err, user) => {
    if (!user) {
      // if no user, return error
      res.json({type: 'error', message: 'Account not found'})
    } else {
      // if user, check authentication
      if ( user.authenticated(req.body.password) ) {
        // if authenticated, sign a token (login)
        var token = jwt.sign(user.toObject(), process.env.JWT_SECRET, {
          expiresIn: "1d"
        });
        // return the token
        res.json({type: 'success', user: user.toObject(), token})
      } else {
        res.json({type: 'error', message: 'Authentication failure'})
      }
    }
  })
})

// Route for token validation
router.post('/me/from/token', (req, res) => {
  // Make sure they sent us a token to check
  let token = req.body.token;
  if (!token) {
    // If no token, return error
    res.json({type: 'error', message: 'You must pass a valid token!'});
  } else {
    // If token, verify it
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        // If invalid, return an error
        res.json({type: 'error', message: 'Invalid token. Please log in again.'});
      } else {
        // If token is valid...
        //   Look up the user in the db
        User.findById(user._id, (err, user) => {
          if (err) {
            //   If user doesn't exist, return an error
            res.json({type: 'error', message: 'Database error during validation.'});
          } else {
            //   If user exists, send user and token back to React
            res.json({type: 'success', user: user.toObject(), token});
          }
        })
      }
    })
  }
});

module.exports = router;