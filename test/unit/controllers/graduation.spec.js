import sinon from 'sinon'
import Graduation from '../../../src/models/graduation'
import GraduationController from '../../../src/controllers/graduation'

describe('Controller: graduation', () => {
  const listGraduation = [
    {
      name: 'engenharia de software',
      departmentID: ['56cb91bdc3464f14678934ca'],
      departmentName: ['department name']
    }
  ]
  const aggregateParams = [
    { 
      "$lookup": {
      "localField": "department",
      "from": "departments", 
      "foreignField": "_id",
      "as": "departments"
    }
  },
    {
      "$addFields": {
        "departmentID": "$departments._id",
        "departmentName": "$departments.name"
      }
    },
    {
      "$project":
      {
        "departments": 0
      }

  }]
  describe('when adding graduation', () => {
    it('should save a graduation into the database', () => {
      const request = {
        body: {
          name: 'engenharia de software',
          departmentID: '56cb91bdc3464f14678934ca',
        }
      }
      const response = {
        send: sinon.spy(),
        status: sinon.stub()
      }
      class fakeGraduation {
        save () {}
      }
      sinon.stub(fakeGraduation.prototype, 'save').withArgs().resolves()
      response.status.withArgs(201).returns(response)
      
      const graduationController = new GraduationController(fakeGraduation)
      return graduationController.create(request, response).then(() => {
        sinon.assert.calledWith(response.send)
      })
    })
  })
  describe('when reading all the graduations', () => {
    it('should return all the graduations', () => {
      const request = {}
      const response = {
        send: sinon.spy()
      }
      Graduation.aggregate = sinon.stub()
      Graduation.aggregate.withArgs(aggregateParams).resolves(listGraduation)

      const graduationController = new GraduationController(Graduation)
      return graduationController.readAll(request, response)
        .then(() => {
          sinon.assert.calledWith(response.send, listGraduation)
      })
    })
  })
  describe('when deleting a graduation', () => {
    it('should return an confirmation that it was deleted', () => {
      const request = {
        params: {
          id: '5cd76713d7d9ed1ce4e7a270'
        }
      }
      const response = {
        send: sinon.spy()
      }
      const { params : { id } } = request
      Graduation.deleteOne = sinon.stub()
      Graduation.deleteOne.withArgs({ _id: id}).resolves('removed with success')

      const graduationController = new GraduationController(Graduation)
      return graduationController.delete(request, response)
        .then(() => {
          sinon.assert.calledWith(response.send, {message: 'removed with success'})
        })
    })
  }),
  describe('when editing a graduation', () => {
    it('should response with 200 when graduation has been updated', () => {
      const request = {
        body: {
          name: 'engenharia da computação'
        },
        params: {
          id: '5cd76713d7d9ed1ce4e7a270'
        }
      }
      const response = {
        send: sinon.spy(),
        status: sinon.stub()
      }
      
      response.status.withArgs(201).returns(response)
      const { params : { id } } = request
      Graduation.update = sinon.stub()
      Graduation.update.withArgs({ _id: id}, request.body).resolves({ ok: 1 })
  
      const graduationController = new GraduationController(Graduation)
      return graduationController.update(request, response)
        .then(() => {
          sinon.assert.calledWith(response.send, { ok: 1 })
        })
    })
  })
})
