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
      let school = {name: 'Школа мобильной разработки'};
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
      let school = {name: 'Школа мобильной разработки', students: 50};
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
      let school = new School({name: 'Школа мобильной разработки', number_of_students: 50});
      school.save((err, res) => {
        let school = {name: 'Школа мобильной разработки', number_of_students: 50};
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
              res.body.should.have.property('error', `Your request doens't contain params for udate. Params available for update: name, students.`);
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
            res.body.should.have.property('error', `Can't update, school doesn't exist`);
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
  });
});
