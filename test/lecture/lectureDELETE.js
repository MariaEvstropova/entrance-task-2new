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

describe('Lecture DELETE', () => {
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

  describe('[DELETE] /v1/lectures/:id', () => {
    it('it should not delete lecture with fake id', (done) => {
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
              .delete(`/v1/lectures/${classroom.id}`)
              .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('success', false);
                res.body.should.have.property('error');
                res.body.error.should.be.a('object');
                res.body.error.should.have.property('message', `No lecture with id = ${classroom.id} in database`);
                done();
              });
        })
      });
    });

    it('it should delete lecture', (done) => {
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
              .delete(`/v1/lectures/${lecture.id}`)
              .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('success', true);
                res.body.should.have.property('message');
                res.body.message.should.be.a('object');
                res.body.message.should.have.property('name', 'Распределенные вычисления');
                res.body.message.should.have.property('date', '2017-07-03T16:00:00.000Z');
                res.body.message.should.have.property('classroom', classroom.id);
                res.body.message.should.have.property('school');
                res.body.message.school.should.be.an('array');
                res.body.message.school.length.should.be.eql(1);
                res.body.message.school.should.include.members([school.id]);
                res.body.message.should.have.property('teacher', 'Васечкин');
                done();
              });
        })
      });
    });
  });
});
