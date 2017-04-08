process.env.NODE_ENV = 'test';

const mongoose = require('mongoose');
const Classroom = require('../models/classroom');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();

chai.use(chaiHttp);

describe('Classroom', () => {
  //Каждый раз перед запуском теста неоходимо очистить тестовую БД
  beforeEach((done) => {
    Classroom.remove({}, (err) => {
      done();
    });
  });

  describe('[GET] /v1/classrooms', () => {
    it('it should GET all the classrooms', (done) => {
      chai.request(server)
          .get('/v1/classrooms')
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('success', true);
            res.body.should.have.property('data');
            res.body.data.should.be.a('array');
            res.body.data.length.should.be.eql(0);
            done();
          });
    });
  });

  describe('[POST] /v1/classrooms', () => {
    it('it should not post empty classroom', (done) => {
      let classroom = {};
      chai.request(server)
          .post('/v1/classrooms')
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('success', false);
            res.body.should.have.property('error');
            res.body.error.should.be.a('object');
            res.body.error.should.have.property('errors');
            res.body.error.errors.should.have.property('name');
            res.body.error.errors.should.have.property('volume');
            done();
          });
    });
  });
});
