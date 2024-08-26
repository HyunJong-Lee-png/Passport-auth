const express = require('express');
const passport = require('passport');
const User = require('../models/user');

const router = express.Router();

router.get('/', (req, res) => {
  console.log('req.user:', req.user);
  res.render('home');
});

router.route('/login')
  .get((req, res, next) => {
    res.render('login');
  })
  .post(passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
  }));

router.route('/signup')
  .get((req, res) => {
    res.render('signup');
  })
  .post((req, res, next) => {
    User.register(new User({ username: req.body.lalala }), req.body.lololo, (err, user) => {
      if (err) {
        console.log('error while user register!', err);
        return next(err);
      }

      console.log('user registered!');
      //회원가입후 바로 로그인할 때
      passport.authenticate('local')(req, res, () => {
        res.redirect('/');
      });
    });
  });

module.exports = router;