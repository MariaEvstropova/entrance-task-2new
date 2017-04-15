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

describe('School PUT', () => {
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

  describe('[PUT] /v1/schools/:id', () => {
    it('it should return warning if update info is empty', (done) => {
      let school = new School({name: 'Школа разработки пароходов', students: 25});
      school.save((err, res) => {
        let update = {};
        chai.request(server)
            .put(`/v1/schools/${school.id}`)
            .send(update)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('success', false);
              res.body.should.have.property('error', `Your request doens't contain params for update. Params available for update: name, students.`);
              done();
            });
      });
    });

    it('it should return warning if there is no school with given id in database', (done) => {
      let update = {name: 'Школа разработки пароходов', students: 25};
      chai.request(server)
          .put('/v1/schools/58e87166c0b4b02f6877d70c')
          .send(update)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('success', false);
            res.body.should.have.property('error');
            res.body.error.should.be.a('object');
            res.body.error.should.have.property('message', 'No school with id = 58e87166c0b4b02f6877d70c in database');
            done();
          });
    });

    it('it should change only name', (done) => {
      let school = new School({name: 'Школа разработки пароходов', number_of_students: 25});
      school.save((err, res) => {
        let update = {name: 'Школа разработки интерфейсов'};
        chai.request(server)
            .put(`/v1/schools/${school.id}`)
            .send(update)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('success', true);
              res.body.should.have.property('message');
              res.body.message.should.be.a('object');
              res.body.message.should.have.property('name', 'Школа разработки интерфейсов');
              res.body.message.should.have.property('number_of_students', 25);
              res.body.message.should.have.property('_id', school.id);
              done();
            });
      });
    });

    it('it should change only number of students', (done) => {
      let school = new School({name: 'Школа разработки пароходов', number_of_students: 25});
      school.save((err, res) => {
        let update = {students: 30};
        chai.request(server)
            .put(`/v1/schools/${school.id}`)
            .send(update)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('success', true);
              res.body.should.have.property('message');
              res.body.message.should.be.a('object');
              res.body.message.should.have.property('name', 'Школа разработки пароходов');
              res.body.message.should.have.property('number_of_students', 30);
              res.body.message.should.have.property('_id', school.id);
              done();
            });
      });
    });

    it('it should not change number of students', (done) => {
      let update = {students: 100};
      let classroom = new Classroom({name: 'Синий кит', volume: 120, location: 'Первый этаж'});
      let school1 = new School({name: 'Школа мобильной разработки', number_of_students: 50});
      let school2 = new School({name: 'Школа мобильного дизайна', number_of_students: 70});
      let promises = [classroom.save(), school1.save(), school2.save()];
      Promise.all(promises).then((data) => {
        let lecture = new Lecture({
          name: 'Распределенные вычисления',
          date: new Date('2017-07-03 19:00'),
          classroom: data[0]['_id'],
          school: [data[1]['_id'], data[2]['_id']],
          teacher: 'Васечкин'
        });
        lecture.save((err, res) => {
          chai.request(server)
              .put(`/v1/schools/${school1.id}`)
              .send(update)
              .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('success', false);
                res.body.should.have.property('error');
                res.body.error.should.be.a('object');
                res.body.error.should.have.property('message', 'Too many students, volume of classroom = 120, audience = 170, number of students to test = 100');
                done();
              });
        });
      });
    });
  });
});
