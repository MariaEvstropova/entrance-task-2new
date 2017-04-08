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
});
