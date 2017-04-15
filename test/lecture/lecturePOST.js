process.env.NODE_ENV = 'test';

const mongoose = require('mongoose');
const Lecture = require('../../models/lecture');
const Classroom = require('../../models/classroom');
const School = require('../../models/school');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../../server');
let should = chai.should();

chai.use(chaiHttp);

describe('Lecture POST', () => {
  //Каждый раз перед запуском теста неоходимо очистить тестовую БД
  beforeEach((done) => {
    Promise.all([
      Lecture.remove({}),
      Classroom.remove({}),
      School.remove({})
    ]).then(() => {
      done();
    });
  });

  describe('[POST] /v1/lectures', () => {
    it('it should not post lecture without classroom', (done) => {
      let lecture = {
        name: 'Распределенные вычисления',
        date: '2017-05-10 19:00',
        school: ['58ea7b6cb016f20a09e28215'],
        teacher: 'Васечкин'
      };
      chai.request(server)
          .post('/v1/lectures')
          .send(lecture)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('success', false);
            res.body.should.have.property('error');
            res.body.error.should.be.a('object');
            res.body.error.should.have.property('message', 'Classroom id is incorrect');
            done();
          });
    });

    it('it should not post lecture without school', (done) => {
      let lecture = {
        name: 'Распределенные вычисления',
        date: '2017-05-10 19:00',
        classroom: '58ea7b6cb016f20a09e28215',
        teacher: 'Васечкин'
      };
      chai.request(server)
          .post('/v1/lectures')
          .send(lecture)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('success', false);
            res.body.should.have.property('error');
            res.body.error.should.be.a('object');
            res.body.error.should.have.property('message', 'Schools array is empty');
            done();
          });
    });

    it('it should not post lecture with invalid date', (done) => {
      let classroom = new Classroom({name: 'Синий кит', volume: 100, location: 'Первый этаж'});
      let school = new School({name: 'Школа мобильной разработки', number_of_students: 50});
      let promises = [classroom.save(), school.save()];
      Promise.all(promises).then((data) => {
        let lecture = {
          name: 'Распределенные вычисления',
          date: '2017-05-0 19:00',
          classroom: classroom.id,
          schools: [school.id],
          teacher: 'Васечкин'
        };
        chai.request(server)
            .post('/v1/lectures')
            .send(lecture)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('success', false);
              res.body.should.have.property('error');
              res.body.error.should.be.a('object');
              res.body.error.should.have.property('message', 'There is issue with date and time you\'ve provided');
              done();
            });
      });

      it('it should not post lecture if it exists', (done) => {
        let lecture = new Lecture({
          name: 'Распределенные вычисления',
          date: '2017-05-10 19:00',
          classroom: classroom.id,
          schools: [school.id],
          teacher: 'Васечкин'
        });
        lecture.save((err, res) => {
          let lecture = {
            name: 'Распределенные вычисления',
            date: '2017-05-10 19:00',
            classroom: classroom.id,
            schools: [school.id],
            teacher: 'Васечкин'
          };
          chai.request(server)
              .post('/v1/lectures')
              .send(lecture)
              .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('success', false);
                res.body.should.have.property('error');
                res.body.error.should.be.a('object');
                res.body.error.should.have.property('message', 'Lecture with privided name is already exist');
                done();
              });
          });
        });
    });

    it('it should not post lecture if too many students', (done) => {
      let classroom = new Classroom({name: 'Синий кит', volume: 100, location: 'Первый этаж'});
      let school1 = new School({name: 'Школа мобильной разработки', number_of_students: 100});
      let school2 = new School({name: 'Школа мобильного дизайна', number_of_students: 100});
      let promises = [classroom.save(), school1.save(), school2.save()];
      Promise.all(promises).then((data) => {
        let lecture = {
          name: 'Распределенные вычисления',
          date: '2017-05-10 19:00',
          classroom: classroom.id,
          schools: [school1.id, school2.id],
          teacher: 'Васечкин'
        };
        chai.request(server)
            .post('/v1/lectures')
            .send(lecture)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('success', false);
              res.body.should.have.property('error');
              res.body.error.should.be.a('object');
              res.body.error.should.have.property('message', 'Too many students, volume of classroom = 100');
              done();
            });
      });
    });

    it('it should post lecture with valid data', (done) => {
      let classroom = new Classroom({name: 'Синий кит', volume: 100, location: 'Первый этаж'});
      let school = new School({name: 'Школа мобильной разработки', number_of_students: 50});
      let promises = [classroom.save(), school.save()];
      Promise.all(promises).then((data) => {
        let lecture = {
          name: 'Распределенные вычисления',
          date: '2017-05-05 19:00',
          classroom: classroom.id,
          schools: [school.id],
          teacher: 'Васечкин'
        };
        chai.request(server)
            .post('/v1/lectures')
            .send(lecture)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('success', true);
              res.body.should.have.property('message');
              res.body.message.should.be.a('object');
              res.body.message.should.have.property('name', 'Распределенные вычисления');
              res.body.message.should.have.property('date', '2017-05-05T16:00:00.000Z');
              res.body.message.should.have.property('classroom');
              res.body.message.should.have.property('school');
              res.body.message.should.have.property('teacher', 'Васечкин');
              done();
            });
      });
    });
  });
});
