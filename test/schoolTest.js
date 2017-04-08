process.env.NODE_ENV = 'test';

const mongoose = require('mongoose');
const School = require('../models/school');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();

chai.use(chaiHttp);

describe('School', () => {
  //Каждый раз перед запуском теста неоходимо очистить тестовую БД
  beforeEach((done) => {
    School.remove({}, (err) => {
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

    describe('[POST] /v1/schools', () => {
      //Проверка вставки пустой школы (без данных)
      it('it should not post empty school', (done) => {
        let school = {};
        chai.request(server)
            .post('/v1/schools')
            .send(school)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('success', false);
              res.body.should.have.property('error');
              res.body.error.should.be.a('object');
              res.body.error.should.have.property('errors');
              res.body.error.errors.should.have.property('name');
              res.body.error.errors.should.have.property('number_of_students');
              done();
            });
      });
    });

    //Проверка вставки школы без названия
    it('it should not post school without name', (done) => {
      let school = {students: 50};
      chai.request(server)
          .post('/v1/schools')
          .send(school)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('success', false);
            res.body.should.have.property('error');
            res.body.error.should.be.a('object');
            res.body.error.should.have.property('errors');
            res.body.error.errors.should.have.property('name');
            res.body.error.errors.should.not.have.property('number_of_students');
            done();
          });
    });

    //Проверка вставки школы без числа учащихся
    it('it should not post school without name', (done) => {
      let school = {name: "Школа мобильной разработки"};
      chai.request(server)
          .post('/v1/schools')
          .send(school)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('success', false);
            res.body.should.have.property('error');
            res.body.error.should.be.a('object');
            res.body.error.should.have.property('errors');
            res.body.error.errors.should.have.property('number_of_students');
            res.body.error.errors.should.not.have.property('name');
            done();
          });
    });

    //Проверка вставки школы с валидными данными
    it('it should post school with valid params', (done) => {
      let school = {name: "Школа мобильной разработки", students: 50};
      chai.request(server)
          .post('/v1/schools')
          .send(school)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('success', true);
            res.body.should.have.property('message');
            res.body.message.should.be.a('object');
            res.body.message.should.have.property('name', 'Школа мобильной разработки');
            res.body.message.should.have.property('number_of_students', 50);
            done();
          });
    });

    //Проверка вставки школы, уже существующей в базе данных
    it('it should not post school which already exists in database', (done) => {
      let school = new School({name: "Школа мобильной разработки", number_of_students: 50});
      school.save((err, res) => {
        let school = {name: "Школа мобильной разработки", number_of_students: 50};
        chai.request(server)
            .post('/v1/schools')
            .send(school)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('success', false);
              res.body.should.have.property('error', 'School with name "Школа мобильной разработки" exists');
              done();
            });
      });
    });

  });
});
