const express = require('express')
const fs = require('fs')
const sha1 = require('sha1')
const path = require('path')
const router = express.Router()

const UserModel = require('../models/users')
const checkNotLogin = require('../middlewares/check').checkNotLogin

router.get('/', checkNotLogin, function (req, res, next) {
  res.render('signup')
})

router.post('/', checkNotLogin, function (req, res, next) {
  const name = req.fields.name
  const gender = req.fields.gender
  const bio = req.fields.bio
  const avatar = req.files.avatar.path.split(path.sep).pop()
  let password = req.fields.password
  const repassword = req.fields.repassword

  try {
    if (!(name.length >= 1 && name.length <= 10)) {
      throw new Error('name length limited in 10')
    }
    if (['m', 'f', 'x'].indexOf(gender) === -1) {
      throw new Error('gender only be m, f or x')
    }
    if (!(bio.length >= 1 && bio.length <= 30)) {
      throw new Error('bio length limited in 30')
    }
    if (!req.files.avatar.name) {
      throw new Error('leakge avatar')
    }
    if (password.length < 6) {
      throw new Error('password length must >= 6')
    }
    if (password !== repassword) {
      throw new Error('twice input password is not same')
    }
  } catch (e) {
    fs.unlink(req.files.avatar.path)
    req.flash('error', e.message)
    return res.redirect('/signup')
  }

  password = sha1(password)

  let user = {
    name: name,
    password: password,
    gender: gender,
    bio: bio,
    avatar: avatar
  }

  UserModel.create(user)
    .then(function (result) {
      user = result.ops[0]
      delete user.password
      req.session.user = user
      req.flash('success', 'signup success')
      res.redirect('/posts')
    })
    .catch(function (e) {
      fs.unlink(req.files.avatar.path)
      if (e.message.match('duplicate key')) {
        req.flash('error', 'user name has be used')
        return res.redirect('/signup')
      }
      next(e)
    })
})

module.exports = router
