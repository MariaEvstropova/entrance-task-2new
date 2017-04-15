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

describe('School DELETE', () => {
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

  describe('[DELETE] /v1/schools/:id', () => {
    it('it should not delete school if there are planned lections in it', (done) => {
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
              .delete(`/v1/schools/${data[1]['_id']}`)
              .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('success', false);
                res.body.should.have.property('error');
                res.body.error.should.be.a('object');
                res.body.error.should.have.property('message', `Can not delete school. Change lectures to be able to delete: ${lecture.name}`);
                done();
              });
        });
      });
    });

    it('it should return error if school doesn\'t exist', (done) => {
      chai.request(server)
          .delete('/v1/schools/58e87166c0b4b02f6877d70c')
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

    it('it should delete school', (done) => {
      let school = new School({name: 'Школа разработки пароходов', number_of_students: 25});
      school.save((err, res) => {
        chai.request(server)
            .delete(`/v1/schools/${school.id}`)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('success', true);
              res.body.should.have.property('message');
              res.body.message.should.be.a('object');
              res.body.message.should.have.property('name', 'Школа разработки пароходов');
              res.body.message.should.have.property('number_of_students', 25);
              res.body.message.should.have.property('_id', school.id);
              done();
            });
      });
    });
  });
});
