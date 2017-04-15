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

describe('School GET', () => {
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

  describe('[GET] /v1/schools', () => {
    //БД была очищена методом beforeEach, так что массив должен быть пустым
    it('it should GET all the schools', (done) => {
      chai.request(server)
          .get('/v1/schools')
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

    //Проверка нахождения школы по id
    it('it should return school by id', (done) => {
      let school = new School({name: 'Школа мобильной разработки', number_of_students: 50});
      school.save((err, res) => {
        chai.request(server)
            .get(`/v1/schools/${school.id}`)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('success', true);
              res.body.should.have.property('data');
              res.body.data.should.be.a('object');
              res.body.data.should.have.property('name', 'Школа мобильной разработки');
              res.body.data.should.have.property('number_of_students', 50);
              done();
            });
      });
    });

  });
});
