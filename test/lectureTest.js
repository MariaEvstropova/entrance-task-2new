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

  describe('[PUT] /v1/lectures/:id', () => {
    it('it should return error if update info is empty', (done) => {
      let update = {};
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
              .put(`/v1/lectures/${lecture.id}`)
              .send(update)
              .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('success', false);
                res.body.should.have.property('error');
                res.body.error.should.be.a('object');
                res.body.error.should.have.property('message', `Your request doens't contain params for update. Params available for update: name, date, classroom, schools, teacher.`);
                done();
              });
        });
      });
    });

    it('it should return error if schools in update info are not unique', (done) => {
      let update = {};
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
          update.schools = [data[1]['_id'], data[1]['_id']];
          chai.request(server)
              .put(`/v1/lectures/${lecture.id}`)
              .send(update)
              .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('success', false);
                res.body.should.have.property('error');
                res.body.error.should.be.a('object');
                res.body.error.should.have.property('message', 'Schools in array must be unique');
                done();
              });
        });
      });
    });

    it('it should return error if lecture does not exist', (done) => {
      let update = {};
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
          update.schools = [data[1]['_id']];
          chai.request(server)
              .put(`/v1/lectures/${school.id}`)
              .send(update)
              .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('success', false);
                res.body.should.have.property('error');
                res.body.error.should.be.a('object');
                res.body.error.should.have.property('message', `Lecture with id = "${school.id}" does not exist`);
                done();
              });
        });
      });
    });

    it('it should return error if new name is not available', (done) => {
      let update = {name: 'Операционные системы'};
      let classroom = new Classroom({name: 'Синий кит', volume: 100, location: 'Первый этаж'});
      let school = new School({name: 'Школа мобильной разработки', number_of_students: 50});
      let promises = [classroom.save(), school.save()];
      Promise.all(promises).then((data) => {
        let lecture1 = new Lecture({
          name: 'Распределенные вычисления',
          date: new Date('2017-07-03 19:00'),
          classroom: data[0]['_id'],
          school: [data[1]['_id']],
          teacher: 'Васечкин'
        });
        let lecture2 = new Lecture({
          name: 'Операционные системы',
          date: new Date('2017-07-04 19:00'),
          classroom: data[0]['_id'],
          school: [data[1]['_id']],
          teacher: 'Васечкин'
        });
        let promises = [lecture1.save(), lecture2.save()];
        Promise.all(promises).then(() => {
          chai.request(server)
              .put(`/v1/lectures/${lecture1.id}`)
              .send(update)
              .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('success', false);
                res.body.should.have.property('error');
                res.body.error.should.be.a('object');
                res.body.error.should.have.property('message', 'Lecture with provided name is already exist');
                done();
              });
        });
      });
    });

    it('it should return error if new date is invalid', (done) => {
      let update = {date: '2017-05-0 19:00'};
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
              .put(`/v1/lectures/${lecture.id}`)
              .send(update)
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
      });
    });

    it('it should return error if new classroom is not available (date the same)', (done) => {
      let update = {};
      let classroom1 = new Classroom({name: 'Синий кит', volume: 100, location: 'Первый этаж'});
      let classroom2 = new Classroom({name: 'Черный кот', volume: 100, location: 'Крыша'});
      let school = new School({name: 'Школа мобильной разработки', number_of_students: 50});
      let promises = [classroom1.save(), classroom2.save(), school.save()];
      Promise.all(promises).then((data) => {
        let lecture1 = new Lecture({
          name: 'Распределенные вычисления',
          date: new Date('2017-07-03 19:00'),
          classroom: data[0]['_id'],
          school: [data[2]['_id']],
          teacher: 'Васечкин'
        });
        let lecture2 = new Lecture({
          name: 'Операционные системы',
          date: new Date('2017-07-03 19:00'),
          classroom: data[1]['_id'],
          school: [data[2]['_id']],
          teacher: 'Васечкин'
        });
        let promises = [lecture1.save(), lecture2.save()];
        Promise.all(promises).then(() => {
          update.classroom = classroom2.id;
          chai.request(server)
              .put(`/v1/lectures/${lecture1.id}`)
              .send(update)
              .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('success', false);
                res.body.should.have.property('error');
                res.body.error.should.be.a('object');
                res.body.error.should.have.property('message', `Classroom id = ${update.classroom} is not available at time = ${lecture1.date.toISOString()}`);
                done();
              });
        });
      });
    });

    it('it should return error if new classroom is not available (new date)', (done) => {
      let update = {};
      let classroom1 = new Classroom({name: 'Синий кит', volume: 100, location: 'Первый этаж'});
      let classroom2 = new Classroom({name: 'Черный кот', volume: 100, location: 'Крыша'});
      let school = new School({name: 'Школа мобильной разработки', number_of_students: 50});
      let promises = [classroom1.save(), classroom2.save(), school.save()];
      Promise.all(promises).then((data) => {
        let lecture1 = new Lecture({
          name: 'Распределенные вычисления',
          date: new Date('2017-07-03 19:00'),
          classroom: data[0]['_id'],
          school: [data[2]['_id']],
          teacher: 'Васечкин'
        });
        let lecture2 = new Lecture({
          name: 'Операционные системы',
          date: new Date('2017-07-04 19:00'),
          classroom: data[1]['_id'],
          school: [data[2]['_id']],
          teacher: 'Васечкин'
        });
        let promises = [lecture1.save(), lecture2.save()];
        Promise.all(promises).then(() => {
          update.classroom = classroom2.id;
          update.date = '2017-07-04 19:00';
          chai.request(server)
              .put(`/v1/lectures/${lecture1.id}`)
              .send(update)
              .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('success', false);
                res.body.should.have.property('error');
                res.body.error.should.be.a('object');
                res.body.error.should.have.property('message', `Classroom id = ${update.classroom} is not available at time = ${lecture2.date.toISOString()}`);
                done();
              });
        });
      });
    });

    it('it should return error if old classroom is not available (new date)', (done) => {
      let update = {};
      let classroom = new Classroom({name: 'Синий кит', volume: 100, location: 'Первый этаж'});
      let school = new School({name: 'Школа мобильной разработки', number_of_students: 50});
      let promises = [classroom.save(), school.save()];
      Promise.all(promises).then((data) => {
        let lecture1 = new Lecture({
          name: 'Распределенные вычисления',
          date: new Date('2017-07-03 19:00'),
          classroom: data[0]['_id'],
          school: [data[1]['_id']],
          teacher: 'Васечкин'
        });
        let lecture2 = new Lecture({
          name: 'Операционные системы',
          date: new Date('2017-07-04 19:00'),
          classroom: data[0]['_id'],
          school: [data[1]['_id']],
          teacher: 'Васечкин'
        });
        let promises = [lecture1.save(), lecture2.save()];
        Promise.all(promises).then(() => {
          update.date = '2017-07-04 19:00';
          chai.request(server)
              .put(`/v1/lectures/${lecture1.id}`)
              .send(update)
              .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('success', false);
                res.body.should.have.property('error');
                res.body.error.should.be.a('object');
                res.body.error.should.have.property('message', `Classroom id = ${classroom.id} is not available at time = ${lecture2.date.toISOString()}`);
                done();
              });
        });
      });
    });

    it('it should return error if new schools are not available (date the same)', (done) => {
      let update = {};
      let classroom1 = new Classroom({name: 'Синий кит', volume: 100, location: 'Первый этаж'});
      let classroom2 = new Classroom({name: 'Черный кот', volume: 100, location: 'Крыша'});
      let school1 = new School({name: 'Школа мобильной разработки', number_of_students: 50});
      let school2 = new School({name: 'Школа мобильного дизайна', number_of_students: 50});
      let promises = [classroom1.save(), classroom2.save(), school1.save(), school2.save()];
      Promise.all(promises).then((data) => {
        let lecture1 = new Lecture({
          name: 'Распределенные вычисления',
          date: new Date('2017-07-03 19:00'),
          classroom: classroom1.id,
          school: [school1.id],
          teacher: 'Васечкин'
        });
        let lecture2 = new Lecture({
          name: 'Операционные системы',
          date: new Date('2017-07-03 19:00'),
          classroom: classroom2.id,
          school: [school2.id],
          teacher: 'Васечкин'
        });
        let promises = [lecture1.save(), lecture2.save()];
        Promise.all(promises).then(() => {
          update.schools = [school2.id];
          chai.request(server)
              .put(`/v1/lectures/${lecture1.id}`)
              .send(update)
              .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('success', false);
                res.body.should.have.property('error');
                res.body.error.should.be.a('object');
                res.body.error.should.have.property('message', `School id = ${school2.id} is not available at time = ${lecture1.date.toISOString()}`);
                done();
              });
        });
      });
    });

    it('it should return error if new schools are not available (new date)', (done) => {
      let update = {};
      let classroom1 = new Classroom({name: 'Синий кит', volume: 100, location: 'Первый этаж'});
      let classroom2 = new Classroom({name: 'Черный кот', volume: 100, location: 'Крыша'});
      let school1 = new School({name: 'Школа мобильной разработки', number_of_students: 50});
      let school2 = new School({name: 'Школа мобильного дизайна', number_of_students: 50});
      let promises = [classroom1.save(), classroom2.save(), school1.save(), school2.save()];
      Promise.all(promises).then((data) => {
        let lecture1 = new Lecture({
          name: 'Распределенные вычисления',
          date: new Date('2017-07-03 19:00'),
          classroom: classroom1.id,
          school: [school1.id],
          teacher: 'Васечкин'
        });
        let lecture2 = new Lecture({
          name: 'Операционные системы',
          date: new Date('2017-07-04 19:00'),
          classroom: classroom2.id,
          school: [school2.id],
          teacher: 'Васечкин'
        });
        let promises = [lecture1.save(), lecture2.save()];
        Promise.all(promises).then(() => {
          update.schools = [school2.id];
          update.date = '2017-07-04 19:00';
          chai.request(server)
              .put(`/v1/lectures/${lecture1.id}`)
              .send(update)
              .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('success', false);
                res.body.should.have.property('error');
                res.body.error.should.be.a('object');
                res.body.error.should.have.property('message', `School id = ${school2.id} is not available at time = ${lecture2.date.toISOString()}`);
                done();
              });
        });
      });
    });

    it('it should return error if old schools are not available (new date)', (done) => {
      let update = {};
      let classroom1 = new Classroom({name: 'Синий кит', volume: 100, location: 'Первый этаж'});
      let classroom2 = new Classroom({name: 'Черный кот', volume: 100, location: 'Крыша'});
      let school1 = new School({name: 'Школа мобильной разработки', number_of_students: 50});
      let school2 = new School({name: 'Школа мобильного дизайна', number_of_students: 50});
      let promises = [classroom1.save(), classroom2.save(), school1.save(), school2.save()];
      Promise.all(promises).then((data) => {
        let lecture1 = new Lecture({
          name: 'Распределенные вычисления',
          date: new Date('2017-07-03 19:00'),
          classroom: classroom1.id,
          school: [school1.id],
          teacher: 'Васечкин'
        });
        let lecture2 = new Lecture({
          name: 'Операционные системы',
          date: new Date('2017-07-04 19:00'),
          classroom: classroom2.id,
          school: [school1.id, school2.id],
          teacher: 'Васечкин'
        });
        let promises = [lecture1.save(), lecture2.save()];
        Promise.all(promises).then(() => {
          update.date = '2017-07-04 19:00';
          chai.request(server)
              .put(`/v1/lectures/${lecture1.id}`)
              .send(update)
              .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('success', false);
                res.body.should.have.property('error');
                res.body.error.should.be.a('object');
                res.body.error.should.have.property('message', `School id = ${school1.id} is not available at time = ${lecture2.date.toISOString()}`);
                done();
              });
        });
      });
    });

    it('it should update lecture', (done) => {
      let update = {};
      let classroom1 = new Classroom({name: 'Синий кит', volume: 100, location: 'Первый этаж'});
      let classroom2 = new Classroom({name: 'Черный кот', volume: 100, location: 'Крыша'});
      let school1 = new School({name: 'Школа мобильной разработки', number_of_students: 50});
      let school2 = new School({name: 'Школа мобильного дизайна', number_of_students: 50});
      let promises = [classroom1.save(), classroom2.save(), school1.save(), school2.save()];
      Promise.all(promises).then((data) => {
        let lecture = new Lecture({
          name: 'Распределенные вычисления',
          date: new Date('2017-07-03 19:00'),
          classroom: classroom1.id,
          school: [school1.id],
          teacher: 'Васечкин'
        });
        lecture.save().then(() => {
          update.name = 'Неопределенные вычисления'
          update.date = '2017-07-04 19:00';
          update.classroom = classroom2.id;
          update.schools = [school1.id, school2.id];
          update.teacher = 'Петров';
          chai.request(server)
              .put(`/v1/lectures/${lecture.id}`)
              .send(update)
              .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('success', true);
                res.body.should.have.property('message');
                res.body.message.should.be.a('object');
                res.body.message.should.have.property('name', 'Неопределенные вычисления');
                res.body.message.should.have.property('date', '2017-07-04T16:00:00.000Z');
                res.body.message.should.have.property('classroom', classroom2.id);
                res.body.message.should.have.property('school');
                res.body.message.school.should.be.an('array');
                res.body.message.school.length.should.be.eql(2);
                res.body.message.school.should.include.members([school1.id, school2.id]);
                res.body.message.should.have.property('teacher', 'Петров');
                done();
              });
        });
      });
    });
  });
});
