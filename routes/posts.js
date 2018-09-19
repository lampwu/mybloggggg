const express = require('express')
const router = express.Router()

const PostModel = require('../models/posts')
const CommentModel = require('../models/comments')
const checkLogin = require('../middlewares/check').checkLogin

router.get('/', function (req, res, next) {
  const author = req.query.author

  PostModel.getPosts(author)
    .then(function (posts) {
      res.render('posts', {
        posts: posts
      })
    })
    .catch(next)
})

router.post('/create', checkLogin, function (req, res, next) {
  const author = req.session.user._id
  const title = req.fields.title
  const content = req.fields.content

  try {
    if (!title.length) {
      throw new Error('Please input title')
    }
    if (!content.length) {
      throw new Error('Please input content')
    }
  } catch (e) {
    req.flash('error', e.massage)
    return res.redirect('back')
  }
  let post = {
    author: author,
    title: title,
    content: content
  }

  PostModel.create(post)
    .then(function (result) {
      post = result.ops[0]
      req.flash('success', 'send success')
      res.redirect(`/posts/${post._id}`)
    })
    .catch(next)
})

router.get('/create', checkLogin, function (req, res, next) {
  res.render('create')
})

router.get('/:postId', function (req, res, next) {
  const postId = req.params.postId

  Promise.all([
    PostModel.getPostById(postId),
    CommentModel.getComments(postId),
    PostModel.incPv(postId)
  ])
    .then(function (result) {
      const post = result[0]
      const comments = result[1]
      if (!post) {
        throw new Error('This title is not exist')
      }

      res.render('post', {
        post: post,
        comments: comments
      })
    }).catch(next)
})

router.get('/:postId/edit', checkLogin, function (req, res, next) {
  const postId = req.params.postId
  const author = req.session.user._id

  PostModel.getRawPostById(postId)
    .then(function (post) {
      if (!post) {
        throw new Error('this title is not exist')
      }
      if (author.toString() !== post.author._id.toString()) {
        throw new Error('Permissions is not enough')
      }
      res.render('edit', {
        post: post
      })
    })
    .catch(next)
})

router.post('/:postId/edit', checkLogin, function (req, res, next) {
  const postId = req.params.postId
  const author = req.session.user._id
  const title = req.fields.title
  const content = req.fields.content

  try {
    if (!title.length) {
      throw new Error('Please fillin title')
    }
    if (!content.length) {
      throw new Error('please fillin content')
    }
  } catch (e) {
    req.flash('error', e.massage)
    return res.redirect('back')
  }

  PostModel.getRawPostById(postId)
    .then(function (post) {
      if (!post) {
        throw new Error('title is not exist')
      }
      if (post.author.id.toString() !== author.toString()) {
        throw new Error('You have not permission')
      }
      PostModel.updatePostId(postId, { title: title, content: content })
        .then(function () {
          req.flash('success', 'edit content successfully')
          res.redirect(`/posts/${postId}`)
        })
        .catch(next)
    })
})

router.get('/:postId/remove', checkLogin, function (req, res, next) {
  const postId = req.params.postId
  const author = req.session.user._id

  PostModel.getRawPostById(postId)
    .then(function (post) {
      if (!post) {
        throw new Error('arctitle is not exist')
      }
      if (post.author._id.toString() !== author.toString()) {
        throw new Error('You have not permission')
      }
      PostModel.delPostById(postId)
        .then(function () {
          req.flash('success', 'delete arctitle successfully')
          res.redirect('/posts')
        })
        .catch(next)
    })
})

module.exports = router
