import User from '../../../src/models/users'
import jwt from  'jsonwebtoken'

describe('Routes: Authentication', () => {
  let request

  before(() => {
    return setupApp()
      .then(app => {
        request = supertest(app)
      })
  })
  
  let defaultToken = {}
  
  const defaultAdmin = {
    username: 'admin',
    password: 'admin'
  }
  
  beforeEach(() => {
    const user = new User(defaultAdmin)
    console.log(user)
    user._id = '56cb91bdc3464f14678934ca'
    return User.deleteMany({})
      .then(() => user.save())
  })

  afterEach(() => User.deleteMany({}))
  
  describe('POST /admin/login', () => {
    it('should return token for session admin user', done => {
      request
      .post('/users/admin/login')
      .send(defaultAdmin)
      .end((err, res) => {
        expect(res.body.auth).to.true
        done(err)
      })
    })
  })
})