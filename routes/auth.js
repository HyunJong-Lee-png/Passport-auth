const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const crypto = require('crypto');
const db = require('../db');

const router = express.Router();

router.get('/', (req, res) => {
  console.log('req.user:', req.user);
  console.log('req.session',req.session)
  res.render('home');
})

//로그인/인증 구현
router.route('/login')
  .get((req, res, next) => {
    console.log('req.user:', req.user);
    console.log('req.session',req.session)
    res.render('login');
  })
  .post((req, res) => {
    passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/login'
    })(req, res);
  });

passport.use(new LocalStrategy({
  usernameField: 'lalala',
  passwordField: 'lololo',
}, (username, password, cb) => {
  console.log('local제발되라')
  console.log(username, password);
  db.get("SELECT * FROM users WHERE username = ?", [username], function (err, row) {
    if (err) {
      return cb(err);
    }
    if (!row) {
      console.log('등록안됏을떄');
      return cb(null, false, { message: "Incorrect username or password." });
    }
    crypto.pbkdf2(password, row.salt, 310000, 32, "sha256", function (err, hashedPassword) {
      if (err) {
        return cb(err);
      }
      //db에도 암호화를 거친 비밀번호가 저장돼있으므로 여기서도 암호화 과정을 통해 db와 비교
      if (!crypto.timingSafeEqual(row.hashed_password, hashedPassword)) {
        return cb(null, false, { message: "Incorrect username or password." });
      }
      console.log('local전략:');
      return cb(null, row);
    });
  });
}));

//회원가입 구현
router.route('/signup')
  .get((req, res) => {
    console.log('req.user:', req.user);
    console.log('req.session',req.session)
    res.render('signup');
  })
  .post((req, res, next) => {
   
    db.get('SELECT * FROM users WHERE username = ?', [req.body.lalala], function (err, row) {
      if (err) return next(err);
      if (row) return res.redirect('/signup');

      const salt = crypto.randomBytes(16);
      db.run('INSERT INTO users (username, hashed_password, salt) VALUES (?,?,?)', [
        req.body.lalala,
        crypto.pbkdf2Sync(req.body.lololo, salt, 310000, 32, 'sha256'),
        salt
      ], function (err) {
        if (err) return next(err);
        res.redirect('/')
      })
    })
  });

passport.serializeUser(function (user, done) {
  //이때 req.session에 req.session.passport.user에 id를 저장한다.
  console.log('시리얼라이즈', user);
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  db.get('SELECT * FROM users WHERE id = ?', [id], function (err, row) {
    if (!row) return done(null, false);
    console.log('디시리얼라이즈', id);
    //이때 req.user에 user정보가 저장
    return done(null, row);
  });
});

module.exports = router;

