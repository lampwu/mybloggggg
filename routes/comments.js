const express = require('express')
const router = express.Router()

const checkLogin = require('../middlewares/check').checkLogin
const CommentModel = require('../models/comments')

router.post('/', checkLogin, function (req, res, next) {
  const author = req.session.user._id
  const postId = req.fields.postId
  const content = req.fields.content

  try {
    if (!content.length) {
      throw new Error('please fill comment content')
    }
  } catch (e) {
    req.flash('error', e.message)
    return res.redirect('back')
  }

  const comment = {
    author: author,
    postId: postId,
    content: content
  }

  CommentModel.create(comment)
    .then(function () {
      req.flash('success', 'comment successfully')
      res.redirect('back')
    })
    .catch(next)
})

router.get('/:commentId/remove', checkLogin, function (req, res, next) {
  const commentId = req.params.commentId
  const author = req.session.user._id

  CommentModel.getCommentById(commentId)
    .then(function (comment) {
      if (!comment) {
        throw new Error('comment is not exist')
      }
      if (comment.author.toString() !== author.toString()) {
        throw new Error('You have not permission to comment')
      }
      CommentModel.delCommentById(commentId)
        .then(function () {
          req.flash('success', 'Delete comment successfully')
          res.redirect('back')
        })
        .catch(next)
    })
})

module.exports = router
