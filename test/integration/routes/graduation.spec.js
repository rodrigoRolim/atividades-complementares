import Graduation from "../../../src/models/graduation";
import jwt from 'jsonwebtoken'

describe('Routes: Graduation', () => {
  let request
  let token
  const defaultId = '5cd60a0312c3e687ea34667f'
  const defaultGraduation = {
    __v: 0,
    name: 'engenharia de software',
    department: '5cd5b4d3939ac63f4957dce7'
  }
  const newGraduation = {
    __v: 0,
    name: 'engenharia da computação',
    department: '5cd5b4d3939ac63f4957dce7'
  }
  const listGraduations = {
    _id: '5cd60a0312c3e687ea34667f',
    __v: 0,
    deps: [],
    name: 'engenharia de software'
  }
  before(() => {
    return setupApp()
      .then(app => {
        request = supertest(app)
      })
      .then(() => {
        token = jwt.sign({ defaultId }, process.env.SECRET, {
          expiresIn: 86400
        })
      })
  })
  beforeEach(() => {
    let graduation =  new Graduation(defaultGraduation)
    graduation._id = '5cd60a0312c3e687ea34667f'
    Graduation.deleteMany({})
    return graduation.save()
  })

  afterEach(() => Graduation.deleteMany({}))
  describe('POST /graduation/add', () => {
    it('should return added last graduation', done => {
      request
      .post('/graduation/add')
      .set('authorization', token)
      .send(newGraduation)
      .end((err, res) => {
        expect(res.status).to.be.eql(201)
        done(err)
      })
    })
  })
  describe('GET /graduation/all', () => {
    it('should return list of graduations', done => {
      request
      .get('/graduation/all')
      .set('authorization', token)
      .end((err, res) => {
        expect(res.body).to.be.eql([listGraduations])
        done(err)
      })
    })
  })
  describe('DELETE /graduation/delete/:id', () => {
    it('should return message of removed with success', done => {
      request
      .del(`/graduation/delete/${listGraduations._id}`)
      .set('authorization', token)
      .end((err, res) => {
        expect(res.body).to.be.eql({ message: 'removed with success' })
        done(err)
      })
    })
  })
  describe('PUT /graduation/update/:id', () => {
    it('should return graduation updated recently', done => {
      request
      .put(`/graduation/update/${listGraduations._id}`)
      .set('authorization', token)
      .end((err, res) => {
        expect(res.status).to.be.eql(201)
        done(err)
      })
    })
  })
})