process.env.NODE_ENV = 'test';

const mongoose = require('mongoose');
const Classroom = require('../models/classroom');
const Lecture = require('../models/lecture');
const School = require('../models/school');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();

chai.use(chaiHttp);

describe('Classroom', () => {
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

  describe('[POST] /v1/classrooms', () => {
    //Проверка вставки пустой аудитории (без данных)
    it('it should not post empty classroom', (done) => {
      let classroom = {};
      chai.request(server)
          .post('/v1/classrooms')
          .send(classroom)
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

    //Проверка вставки аудитории без названия
    it('it should not post classroom without name', (done) => {
      let classroom = {volume: 100, location: 'Первый этаж'};
      chai.request(server)
          .post('/v1/classrooms')
          .send(classroom)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('success', false);
            res.body.should.have.property('error');
            res.body.error.should.be.a('object');
            res.body.error.should.have.property('errors');
            res.body.error.errors.should.have.property('name');
            res.body.error.errors.should.not.have.property('volume');
            done();
          });
    });

    //Проверка вставки аудитории без вместимости
    it('it should not post classroom without volume', (done) => {
      let classroom = {name: 'Синий кит', location: 'Первый этаж'};
      chai.request(server)
          .post('/v1/classrooms')
          .send(classroom)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('success', false);
            res.body.should.have.property('error');
            res.body.error.should.be.a('object');
            res.body.error.should.have.property('errors');
            res.body.error.errors.should.have.property('volume');
            res.body.error.errors.should.not.have.property('name');
            done();
          });
    });

    //Проверка вставки аудитории с валидными данными
    it('it should post classroom with valid params', (done) => {
      let classroom = {name: 'Синий кит', volume: 100, location: 'Первый этаж'};
      chai.request(server)
          .post('/v1/classrooms')
          .send(classroom)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('success', true);
            res.body.should.have.property('message');
            res.body.message.should.be.a('object');
            res.body.message.should.have.property('name', 'Синий кит');
            res.body.message.should.have.property('volume', 100);
            res.body.message.should.have.property('location', 'Первый этаж');
            done();
          });
    });

    //Проверка вставки аудитории, уже существующей в базе данных
    it('it should not post classroom which already exists in database', (done) => {
      let classroom = new Classroom({name: 'Синий кит', volume: 100, location: 'Первый этаж'});
      classroom.save((err, res) => {
        let classroom = {name: 'Синий кит', volume: 100, location: 'Первый этаж'};
        chai.request(server)
            .post('/v1/classrooms')
            .send(classroom)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('success', false);
              res.body.should.have.property('error', 'Classroom with name "Синий кит" exists');
              done();
            });
      });
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
              res.body.should.have.property('error', `Your request doens't contain params for udate. Params available for update: name, volume, location.`);
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
            res.body.should.have.property('error', `Can't update, classrom doesn't exist`);
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

    it('it should change only name', (done) => {
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

  describe('[DELETE] /v1/classrooms/:id', () => {
    it('it should not delete classroom if there are planned lections in it', (done) => {
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
              .delete(`/v1/classrooms/${data[0]['_id']}`)
              .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('success', false);
                res.body.should.have.property('error', `Can not delete classroom. Change lectures to be able to delete: ${lecture.name}`);
                done();
              });
        });
      });
    });

    it('it should return error if classroom doesn\'t exist', (done) => {
      chai.request(server)
          .delete('/v1/classrooms/58e87166c0b4b02f6877d70c')
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('success', false);
            res.body.should.have.property('error', 'No classroom with id = 58e87166c0b4b02f6877d70c in database');
            done();
          });
    });

    it('it should delete classroom', (done) => {
      let classroom = new Classroom({name: 'Голубой щенок', volume: 200, location: 'Второй этаж'});
      classroom.save((err, res) => {
        chai.request(server)
            .delete(`/v1/classrooms/${classroom.id}`)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('success', true);
              res.body.should.have.property('message');
              res.body.message.should.be.a('object');
              res.body.message.should.have.property('name', 'Голубой щенок');
              res.body.message.should.have.property('volume', 200);
              res.body.message.should.have.property('location', 'Второй этаж');
              res.body.message.should.have.property('_id', classroom.id);
              done();
            });
      });
    });
  });
});
