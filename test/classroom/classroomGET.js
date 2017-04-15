process.env.NODE_ENV = 'test';

const mongoose = require('mongoose');
const Classroom = require('../../models/classroom');
const Lecture = require('../../models/lecture');
const School = require('../../models/school');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../../server');
let should = chai.should();

chai.use(chaiHttp);

describe('Classroom GET', () => {
  //Каждый раз перед запуском теста неоходимо очистить тестовую БД
  beforeEach((done) => {
    Promise.all([
      Lecture.remove({}),
      Classroom.remove({}),
      School.remove({})
    ])
    .then(() => {
      done();
    });
  });

  describe('[GET] /v1/classrooms', () => {
    //БД была очищена методом beforeEach, так что массив должен быть пустым
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

    //Проверка нахождения аудитории по id
    it('it should return classroom by id', (done) => {
      let classroom = new Classroom({name: 'Синий кит', volume: 100, location: 'Первый этаж'});
      classroom.save((err, res) => {
        chai.request(server)
            .get(`/v1/classrooms/${classroom.id}`)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('success', true);
              res.body.should.have.property('data');
              res.body.data.should.be.a('object');
              res.body.data.should.have.property('name', 'Синий кит');
              res.body.data.should.have.property('volume', 100);
              res.body.data.should.have.property('location', 'Первый этаж');
              done();
            });
      });
    });
  });
});
