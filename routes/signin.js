const sha1 = require('sha1')
const express = require('express')
const router = express.Router()

const UserModel = require('../models/users')
const checkNotLogin = require('../middlewares/check').checkNotLogin

router.get('/', checkNotLogin, function (req, res, next) {
  res.render('signin')
})

router.post('/', checkNotLogin, function (req, res, next) {
  const name = req.fields.name
  const password = req.fields.password
  try {
    if (!name.length) {
      throw new Error('Please input usename')
    }
    if (!password.length) {
      throw new Error('Please input password')
    }
  } catch (e) {
    req.flash('error', e.message)
    return res.redirect('back')
  }

  UserModel.getUserByName(name)
    .then(function (user) {
      if (!user) {
        req.flash('error', 'user is not exist')
        return res.redirect('back')
      }
      if (sha1(password) !== user.password) {
        req.flash('error', 'user name or passowrd incorrect')
        return res.redirect('back')
      }
      req.flash('success', 'login success')
      delete user.password
      req.session.user = user
      res.redirect('/posts')
    }).catch(next)
})

module.exports = router
