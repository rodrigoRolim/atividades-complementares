import sinon from 'sinon'
import Professor from  '../../../src/models/professor'
import ProfessorController from '../../../src/controllers/professor'
import jwt from 'jsonwebtoken'
import br  from 'bcrypt'
import Authorization from '../../../src/services/auth'

describe('Management professor', () => {
  const defaultProfessor = {
    _id: 'id-fake',
    password: 'encrypter-password',
    siape: 'a12345',
    name: 'eduardo siqueira',
    email: 'eduardo@email.com',
    department: '5cd85d1b942d44d0ae60f2fb',
    type_user: 'professor'
  }
  const defaultRequest = {
    params: {}
  };
  describe('when adding professor to graduation', () => {
    it('should save professor into on database', () => {
      const request = Object.assign({}, { body: defaultProfessor })
      const response = {
        send: sinon.spy(),
        status: sinon.stub()
      }
      class fakeProfessor {
        save () {}
      }
      
      response.status.withArgs(201).returns(response)
      sinon.stub(fakeProfessor.prototype, 'save').withArgs().resolves()

      const professorController = new ProfessorController(fakeProfessor)
      return professorController.create(request, response)
        .then(() => {
          sinon.assert.calledWith(response.send)
        })
    })
    context('when an error occurs', () => {
      it('should return 422', () => {
        const response = {
          send: sinon.spy(),
          status: sinon.stub()
        }

        class fakeProfessor {
          save () {}
        }

        response.status.withArgs(422).returns(response)
        sinon.stub(fakeProfessor.prototype, 'save').withArgs().rejects({ message: 'Error'})

        const professorController = new ProfessorController(fakeProfessor)
        
        return professorController.create(defaultRequest, response)
          .then(() => {
            sinon.assert.calledWith(response.status, 422)
          })
      })
    })
  })
  describe('when ask for all professor', () => {
    it('should return list of professors', () => {
      const request = {}
      const response = {
        send: sinon.spy()
      }
      Professor.find = sinon.stub()
      Professor.find.withArgs({}).resolves([defaultProfessor])

      const professorController = new ProfessorController(Professor)
      return professorController.readAll(request, response)
        .then(() => {
          sinon.assert.calledWith(response.send, [defaultProfessor])
      })
    })
    context('when an error occurs', () => {
      it('should return 422', () => {
        const response = {
          send: sinon.spy(),
          status: sinon.stub()
        }
        Professor.find = sinon.stub()
        Professor.find.withArgs({}).rejects({ message: 'Error'})
        
        response.status.withArgs(422).returns(response)
        
        const professorController = new ProfessorController(Professor)
        
        return professorController.readAll(defaultRequest, response)
          .then(() => {
            sinon.assert.calledWith(response.status, 422)
          })
      })
    })
  })
  describe('update professor', () => {
    it('should respond with 200 when the professor has been updated', () => {
      const fakeId = 'a-fake-id'
      const updatedProfessor = {
        _id: fakeId,
        siape: 'a12345',
        name: 'Updated professor',
        email: 'uptade@email',
        department: '5cd85d1b942d44d0ae60f2fb',
        type_user: 'professor',
        password: '123456'
      }
      const request = {
        params: {
          id: fakeId
        },
        body: updatedProfessor
      }
      const response = {
        sendStatus: sinon.spy()
      }

      class fakeProfessor {
        static findOneAndUpdate() {}
      }
      const findOneAndUpdateStub = sinon.stub(fakeProfessor, 'findOneAndUpdate')
      findOneAndUpdateStub.withArgs({ _id: fakeId }, updatedProfessor).resolves(updatedProfessor)
      
      const professorController = new ProfessorController(fakeProfessor);

      return professorController.update(request, response)
        .then(() => {
          sinon.assert.calledWith(response.sendStatus, 200);
        });
    })
    context('when an error occurs', () => {
      it('should return 422', () => {
        const fakeId = 'a-fake-id';
        const updatedProfessor = {
          _id: fakeId,
          siape: 'a12345',
          name: 'Updated professor',
          email: 'uptade@email',
          department: '5cd85d1b942d44d0ae60f2fb',
          type_user: 'professor',
          password: '123456'
        }
        const request = {
          params: {
            id: fakeId
          },
          body: updatedProfessor
        }
        const response = {
          send: sinon.spy(),
          status: sinon.stub()
        };

        class fakeProfessor {
          static findOneAndUpdate() {}
        }

        const findOneAndUpdateStub = sinon.stub(fakeProfessor, 'findOneAndUpdate')
        findOneAndUpdateStub.withArgs({ _id: fakeId }, updatedProfessor).rejects({ message: 'Error' })
        response.status.withArgs(422).returns(response);

        const professorController = new ProfessorController(fakeProfessor)

        return professorController.update(request, response)
          .then(() => {
            sinon.assert.calledWith(response.send, 'Error');
          });
      });
    })
  })
  describe('login() professor', () => {
    it('should call send with a token for professor user', () => {
      const expectedResponse = {
        token: 'hashToken', 
        auth: true, 
        user: defaultProfessor 
      }
      const request = {
        body: {
          siape: 'a12345',
          password: '12345'
        }
      }
      const professor = { _id: 'id-fake', password: 'encrypter-password'}
      br.compare = sinon.stub()
      br.compare.withArgs(request.body.password, professor.password).resolves(true)
      
      jwt.sign = sinon.stub()
      jwt.sign.withArgs({ _id }, process.env.SECRET , {
        expiresIn: 86400
      }).returns('hashToken')
      
      const auth = new Authorization(br.compare, jwt)
      auth.authorization = sinon.stub()
      auth.authorization.withArgs(request.body.password, defaultProfessor).resolves('hashToken')
     
      const response = {
        send: sinon.spy(),
        status: sinon.stub()
      }
      response.status.withArgs(201).returns(response)
      const _id = '12345'

      

      Professor.findOne = sinon.stub()
      Professor.findOne.withArgs({ siape: request.body.siape }).resolves(defaultProfessor)

      const professorController = new ProfessorController(Professor, auth)
      return professorController.login(request, response) 
        .then(() => {
          sinon.assert.calledWith(response.send, expectedResponse)
        })
    })
    context('when an error occurs', () => {
      it('should return code 400', () => {

        const request = {
          body: {
            siape: 'a12345',
            password: '12345'
          }
        }
        const professor = { _id: 'id-fake', password: 'encrypter-password'}
        br.compare = sinon.stub()
        br.compare.withArgs(request.body.password, professor.password).resolves(true)
        
        jwt.sign = sinon.stub()
        jwt.sign.withArgs(professor._id , process.env.SECRET , {
          expiresIn: 86400
        }).returns('hashToken')
        
        const auth = new Authorization(br.compare, jwt)
        auth.authorization = sinon.stub()
        auth.authorization.withArgs(request.body.password, defaultProfessor).resolves('hashToken')
     
      
        const response = {
          send: sinon.spy(),
          status: sinon.stub()
        }
  
        response.status.withArgs(404).returns(response)
  
        Professor.findOne = sinon.stub()
        Professor.findOne.withArgs({ siape: request.body.siape }).rejects({ message: 'No authorization' })
  
        const professorController = new ProfessorController(Professor, auth)
        return professorController.login(request, response) 
          .then(() => {
            sinon.assert.calledWith(response.send, 'No authorization')
          })
      })
    })
  })
  describe('getById(): getting professor by id', () => {
    it('should call send with one professor', () => {
      const fakeId = 'a-fake-id';
      const request = {
        params: {
          id: fakeId
        }
      };
      const response = {
        send: sinon.spy()
      };

      Professor.find = sinon.stub();
      Professor.find.withArgs({ _id: fakeId }).resolves([defaultProfessor]);

      const professorController = new ProfessorController(Professor)

      return professorController.getById(request, response)
        .then(() => {
          sinon.assert.calledWith(response.send, [defaultProfessor]);
        });
    })
    context('when an error occurs', () => {
      it('should return 422 as status code', () => {
        const fakeId = 'a-fake-id';
        const request = {
          params: {
            id: fakeId
          }
        };
        const response = {
          send: sinon.spy(),
          status: sinon.stub()
        };

        Professor.find = sinon.stub();
        Professor.find.withArgs({ _id: fakeId }).rejects({ message: 'Error' });
        
        response.status.withArgs(422).returns(response)
        const professorController = new ProfessorController(Professor);

        return professorController.getById(request, response)
          .then(() => {
            sinon.assert.calledWith(response.send, 'Error');
          });
      })
    })
  })
  describe('remove(): removing documents of approved student', () => {
    it('should remove all documents of approved student', () => {
      const fakeidprofessor = 'a-fake-id-professor';
      const request = {
        params: {
          id: fakeidprofessor
        }
      };
      const response = {
        sendStatus: sinon.spy()
      };

      class fakeProfessor {
        static remove() {}
      }

      const removeStub = sinon.stub(fakeProfessor, 'remove');

      removeStub.withArgs({ _id: fakeidprofessor }).resolves([1]);

      const professorController = new ProfessorController(fakeProfessor);

      return professorController.remove(request, response)
        .then(() => {
          sinon.assert.calledWith(response.sendStatus, 204);
        });
    })
    context('when an error occurs', () => {
      const fakeidprofessor = 'a-fake-id-student';
      const request = {
        params: {
          id: fakeidprofessor
        }
      };
      const response = {
        send: sinon.spy(),
        status: sinon.stub()
      };

      class fakeProfessor {
        static remove() {}
      }

      const removeStub = sinon.stub(fakeProfessor, 'remove')

      removeStub.withArgs({ _id: fakeidprofessor }).rejects({ message: 'Error' })
      response.status.withArgs(422).returns(response)

      const professorController = new ProfessorController(fakeProfessor)

      return professorController.remove(request, response)
        .then(() => {
          sinon.assert.calledWith(response.send, 'Error')
        })
    })
  })
})