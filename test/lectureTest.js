process.env.NODE_ENV = 'test';

const mongoose = require('mongoose');
const Lecture = require('../models/lecture');
const Classroom = require('../models/classroom');
const School = require('../models/school');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();

chai.use(chaiHttp);

describe('Lecture', () => {
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

  describe('[GET] /v1/lectures', () => {
    //БД была очищена методом beforeEach, так что массив должен быть пустым
    it('it should GET all the lectures', (done) => {
      chai.request(server)
          .get('/v1/lectures')
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

    it('it should return lecture by id', (done) => {
      let classroom = new Classroom({name: 'Синий кит', volume: 100, location: 'Первый этаж'});
      let school = new School({name: 'Школа мобильной разработки', number_of_students: 50});
      let promises = [classroom.save(), school.save()];
      Promise.all(promises).then((data) => {
        let lecture = new Lecture({
          name: 'Распределенные вычисления',
          date: new Date('2017-07-03 19:00'),
          classroom: data[0]['_id'],
          school: [data[1]['_id']],
          teacher: 'Васечкин'
        });
        lecture.save((err, res) => {
          chai.request(server)
              .get(`/v1/lectures/${lecture.id}`)
              .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('success', true);
                res.body.should.have.property('data');
                res.body.data.should.be.a('object');
                res.body.data.should.have.property('name', 'Распределенные вычисления');
                res.body.data.should.have.property('date', '2017-07-03T16:00:00.000Z');
                res.body.data.should.have.property('classroom');
                res.body.data.classroom.should.be.a('object');
                res.body.data.classroom.should.have.property('name', 'Синий кит');
                res.body.data.classroom.should.have.property('volume', 100);
                res.body.data.classroom.should.have.property('location', 'Первый этаж');
                res.body.data.should.have.property('school');
                res.body.data.school.should.be.a('array');
                res.body.data.school.length.should.be.eql(1);
                res.body.data.school.should.have.deep.property('[0].name', 'Школа мобильной разработки');
                res.body.data.school.should.have.deep.property('[0].number_of_students', 50);
                res.body.data.should.have.property('teacher', 'Васечкин');
                done();
              });
        })
      });
    });

    describe('[POST] /v1/lectures', () => {
      it('it should not post lecture without classroomName', (done) => {
        let lecture = {
          lectureName: 'Распределенные вычисления',
          lectureDate: '2017-05-10',
          lectureTime: '19:00',
          schoolName: ['Школа разработки интерфейсов'],
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
              res.body.error.should.have.property('message', 'You request must contain classroomName');
              done();
            });
      });

      it('it should not post lecture without schoolName', (done) => {
        let lecture = {
          lectureName: 'Распределенные вычисления',
          lectureDate: '2017-05-10',
          lectureTime: '19:00',
          classroomName: 'Синий кит',
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
              res.body.error.should.have.property('message', 'You request must contain schoolName');
              done();
            });
      });

      it('it should not post lecture with invalid date', (done) => {
        let classroom = new Classroom({name: 'Синий кит', volume: 100, location: 'Первый этаж'});
        let school = new School({name: 'Школа мобильной разработки', number_of_students: 50});
        let promises = [classroom.save(), school.save()];
        Promise.all(promises).then((data) => {
          let lecture = {
            lectureName: 'Распределенные вычисления',
            lectureDate: '2017-05-0',
            lectureTime: '19:00',
            classroomName: 'Синий кит',
            schoolName: ['Школа мобильной разработки'],
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
                res.body.error.should.have.property('message', "There is issue with date and time you've provided");
                done();
              });
        });

        it('it should not post lecture if it exists', (done) => {
          let lecture = new Lecture({
            name: 'Распределенные вычисления',
            date: new Date('2017-07-03 19:00'),
            classroom: data[0]['_id'],
            school: [data[1]['_id']],
            teacher: 'Васечкин'
          });
          lecture.save((err, res) => {
            let lecture = {
              lectureName: 'Распределенные вычисления',
              lectureDate: '2017-05-05',
              lectureTime: '19:00',
              classroomName: 'Синий кит',
              schoolName: ['Школа мобильной разработки'],
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
            lectureName: 'Распределенные вычисления',
            lectureDate: '2017-05-05',
            lectureTime: '19:00',
            classroomName: 'Синий кит',
            schoolName: ['Школа мобильной разработки', 'Школа мобильного дизайна'],
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
            lectureName: 'Распределенные вычисления',
            lectureDate: '2017-05-05',
            lectureTime: '19:00',
            classroomName: 'Синий кит',
            schoolName: ['Школа мобильной разработки'],
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
