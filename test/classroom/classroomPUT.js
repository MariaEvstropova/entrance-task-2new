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

describe('Classroom PUT', () => {
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

  describe('[PUT] /v1/classrooms/:id', () => {
    it('it should return warning if update info is empty', (done) => {
      let classroom = new Classroom({name: 'Голубой щенок', volume: 200, location: 'Второй этаж'});
      classroom.save((err, res) => {
        let update = {};
        chai.request(server)
            .put(`/v1/classrooms/${classroom.id}`)
            .send(update)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('success', false);
              res.body.should.have.property('error');
              res.body.error.should.be.a('object');
              res.body.error.should.have.property('message', `Your request doens't contain params for update. Params available for update: name, volume, location.`);
              done();
            });
      });
    });

    it('it should return warning if there is no classroom with given id in database', (done) => {
      let update = {name: 'Голубой щенок', volume: 200, location: 'Второй этаж'};
      chai.request(server)
          .put('/v1/classrooms/58e87166c0b4b02f6877d70c')
          .send(update)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('success', false);
            res.body.should.have.property('error');
            res.body.error.should.be.a('object');
            res.body.error.should.have.property('message', 'No classroom with id = 58e87166c0b4b02f6877d70c in database');
            done();
          });
    });

    it('it should change only name', (done) => {
      let classroom = new Classroom({name: 'Голубой щенок', volume: 200, location: 'Второй этаж'});
      classroom.save((err, res) => {
        let update = {name: 'Розовый слон'};
        chai.request(server)
            .put(`/v1/classrooms/${classroom.id}`)
            .send(update)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('success', true);
              res.body.should.have.property('message');
              res.body.message.should.be.a('object');
              res.body.message.should.have.property('name', 'Розовый слон');
              res.body.message.should.have.property('volume', 200);
              res.body.message.should.have.property('location', 'Второй этаж');
              res.body.message.should.have.property('_id', classroom.id);
              done();
            });
      });
    });

    it('it sholud not change volume', (done) => {
      let update = {volume: 100};
      let classroom = new Classroom({name: 'Синий кит', volume: 150, location: 'Первый этаж'});
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
            .put(`/v1/classrooms/${classroom.id}`)
            .send(update)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('success', false);
              res.body.should.have.property('error');
              res.body.error.should.be.a('object');
              res.body.error.should.have.property('message', 'Too many students, volume of classroom = 150, volume to test = 100');
              done();
            });
        });
      });
    });

    it('it should change only volume', (done) => {
      let classroom = new Classroom({name: 'Голубой щенок', volume: 200, location: 'Второй этаж'});
      classroom.save((err, res) => {
        let update = {volume: 300};
        chai.request(server)
            .put(`/v1/classrooms/${classroom.id}`)
            .send(update)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('success', true);
              res.body.should.have.property('message');
              res.body.message.should.be.a('object');
              res.body.message.should.have.property('name', 'Голубой щенок');
              res.body.message.should.have.property('volume', 300);
              res.body.message.should.have.property('location', 'Второй этаж');
              res.body.message.should.have.property('_id', classroom.id);
              done();
            });
      });
    });

    it('it should change only location', (done) => {
      let classroom = new Classroom({name: 'Голубой щенок', volume: 200, location: 'Второй этаж'});
      classroom.save((err, res) => {
        let update = {location: 'Чердак'};
        chai.request(server)
            .put(`/v1/classrooms/${classroom.id}`)
            .send(update)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('success', true);
              res.body.should.have.property('message');
              res.body.message.should.be.a('object');
              res.body.message.should.have.property('name', 'Голубой щенок');
              res.body.message.should.have.property('volume', 200);
              res.body.message.should.have.property('location', 'Чердак');
              res.body.message.should.have.property('_id', classroom.id);
              done();
            });
      });
    });
  });
});
