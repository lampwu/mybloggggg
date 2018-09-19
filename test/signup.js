const path = require('path')
const assert = require('assert')
const request = require('supertest')
const app = require('../index')
const User = require('../lib/mongo').User

const testName1 = 'testName1'
const testName2 = 'nswbmw'
describe('signup', function () {
  const agent = request.agent(app)
  this.beforeEach(function (done) {
    User.create({
      name: testName1,
      password:'123456'
      avatar: '',
      gender: 'x',
      bio: ''
    })
    .exec()
    .then(function () {
      done()
    })
    .catch(done)
  })

  afterEach(function (done) {
    process.exit()
  })

  it('wrong name', function (done) {
    agent
      .post('/signup')
      .type('form')
      .field({name: ''})
      .attach('avatar', path.join(__dirname,'avatar.jpg'))
      .redirects()
      .end(function (err,res) {
        if (err) return done(err)
        assert(res.text.match(/name's length is limited in 18 alps/))
        done()
      })
  })
  it('wrong gender',  function (done) {
    agent
      .post('/signup')
      .type('form')
      .field({ name: testName2, gender: 'a' })
      .attach('avatar',path.join(__dirname, 'avatar.jpg'))
      .redirects()
      .end(function (err,res) {
        if (err) return done(err)
        assert(res.text.match(/gender is only be m,f or x/))
        done()
      })
  })
  it('duplicate name', function (done) {
    agent
      .post('signup')
      .type('form')
      .field({ name: testName2, gender: 'a' })
      .attach('avatar',path.join(__dirname, 'avatar.jpg'))
      .redirects()
      .end(function (err,res) {
        if (err) return done(err)
        assert(res.text.match(/gender is only be m,f or x/))
        done()
      })
  })
})
