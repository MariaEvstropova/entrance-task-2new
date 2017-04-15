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

describe('Lecture GET', () => {
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
  });

  describe('[GET] /v1/lectures/classroom/:id', () => {
    it('it should get all lectures for classroom (no dates provided)', (done) => {
      let classroom1 = new Classroom({name: 'Синий кит', volume: 100, location: 'Первый этаж'});
      let classroom2 = new Classroom({name: 'Розовый слон', volume: 100, location: 'Второй этаж'});
      let school = new School({name: 'Школа мобильной разработки', number_of_students: 50});
      let promises = [classroom1.save(), classroom2.save(), school.save()];
      Promise.all(promises).then((data) => {
        let lecturePromises = [];

        for(let i = 1; i < 10; i++) {
          let lecture = new Lecture({
            name: `Распределенные вычисления №${i}`,
            date: new Date(`2017-07-0${i} 19:00`),
            classroom: data[i%2]['_id'],
            school: school.id,
            teacher: 'Васечкин'
          });
          lecturePromises.push(lecture.save());
        }

        return Promise.all(lecturePromises).then((data) => {
          chai.request(server)
              .get(`/v1/lectures/classroom/${classroom1.id}`)
              .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('success', true);
                res.body.should.have.property('message');
                res.body.message.should.be.an('array');
                res.body.message.length.should.be.eql(4);
                res.body.message.should.all.have.deep.property('[0].classroom', classroom1.id);
                done();
              });
        });
      });
    });

    it('it should get all lectures for classroom (2 dates provided)', (done) => {
      let classroom1 = new Classroom({name: 'Синий кит', volume: 100, location: 'Первый этаж'});
      let classroom2 = new Classroom({name: 'Розовый слон', volume: 100, location: 'Второй этаж'});
      let school = new School({name: 'Школа мобильной разработки', number_of_students: 50});
      let promises = [classroom1.save(), classroom2.save(), school.save()];
      Promise.all(promises).then((data) => {
        let lecturePromises = [];

        for(let i = 1; i < 10; i++) {
          let lecture = new Lecture({
            name: `Распределенные вычисления №${i}`,
            date: new Date(`2017-07-0${i} 19:00`),
            classroom: data[i%2]['_id'],
            school: school.id,
            teacher: 'Васечкин'
          });
          lecturePromises.push(lecture.save());
        }

        return Promise.all(lecturePromises).then((data) => {
          chai.request(server)
              .get(`/v1/lectures/classroom/${classroom1.id}?from=2017-07-01&to=2017-07-05`)
              .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('success', true);
                res.body.should.have.property('message');
                res.body.message.should.be.an('array');
                res.body.message.length.should.be.eql(2);
                res.body.message.should.all.have.deep.property('[0].classroom', classroom1.id);
                done();
              });
        });
      });
    });

    it('it should get all lectures for classroom (from date provided)', (done) => {
      let classroom1 = new Classroom({name: 'Синий кит', volume: 100, location: 'Первый этаж'});
      let classroom2 = new Classroom({name: 'Розовый слон', volume: 100, location: 'Второй этаж'});
      let school = new School({name: 'Школа мобильной разработки', number_of_students: 50});
      let promises = [classroom1.save(), classroom2.save(), school.save()];
      Promise.all(promises).then((data) => {
        let lecturePromises = [];

        for(let i = 1; i < 10; i++) {
          let lecture = new Lecture({
            name: `Распределенные вычисления №${i}`,
            date: new Date(`2017-07-0${i} 19:00`),
            classroom: data[i%2]['_id'],
            school: school.id,
            teacher: 'Васечкин'
          });
          lecturePromises.push(lecture.save());
        }

        return Promise.all(lecturePromises).then((data) => {
          chai.request(server)
              .get(`/v1/lectures/classroom/${classroom1.id}?from=2017-07-05`)
              .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('success', true);
                res.body.should.have.property('message');
                res.body.message.should.be.an('array');
                res.body.message.length.should.be.eql(2);
                res.body.message.should.all.have.deep.property('[0].classroom', classroom1.id);
                done();
              });
        });
      });
    });

    it('it should get all lectures for classroom (to date provided)', (done) => {
      let classroom1 = new Classroom({name: 'Синий кит', volume: 100, location: 'Первый этаж'});
      let classroom2 = new Classroom({name: 'Розовый слон', volume: 100, location: 'Второй этаж'});
      let school = new School({name: 'Школа мобильной разработки', number_of_students: 50});
      let promises = [classroom1.save(), classroom2.save(), school.save()];
      Promise.all(promises).then((data) => {
        let lecturePromises = [];

        for(let i = 1; i < 10; i++) {
          let lecture = new Lecture({
            name: `Распределенные вычисления №${i}`,
            date: new Date(`2017-07-0${i} 19:00`),
            classroom: data[i%2]['_id'],
            school: school.id,
            teacher: 'Васечкин'
          });
          lecturePromises.push(lecture.save());
        }

        return Promise.all(lecturePromises).then((data) => {
          chai.request(server)
              .get(`/v1/lectures/classroom/${classroom1.id}?to=2017-07-05`)
              .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('success', true);
                res.body.should.have.property('message');
                res.body.message.should.be.an('array');
                res.body.message.length.should.be.eql(2);
                res.body.message.should.all.have.deep.property('[0].classroom', classroom1.id);
                done();
              });
        });
      });
    });

    it('it should return error if date is not valid', (done) => {
      let classroom1 = new Classroom({name: 'Синий кит', volume: 100, location: 'Первый этаж'});
      let classroom2 = new Classroom({name: 'Розовый слон', volume: 100, location: 'Второй этаж'});
      let school = new School({name: 'Школа мобильной разработки', number_of_students: 50});
      let promises = [classroom1.save(), classroom2.save(), school.save()];
      Promise.all(promises).then((data) => {
        let lecturePromises = [];

        for(let i = 1; i < 10; i++) {
          let lecture = new Lecture({
            name: `Распределенные вычисления №${i}`,
            date: new Date(`2017-07-0${i} 19:00`),
            classroom: data[i%2]['_id'],
            school: school.id,
            teacher: 'Васечкин'
          });
          lecturePromises.push(lecture.save());
        }

        return Promise.all(lecturePromises).then((data) => {
          chai.request(server)
              .get(`/v1/lectures/classroom/${classroom1.id}?to=2017-07-0`)
              .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('success', false);
                res.body.should.have.property('error');
                res.body.error.should.be.a('object');
                res.body.error.should.have.property('message', 'There is issue with date to you\'ve provided');
                done();
              });
        });
      });
    });
  });

  describe('[GET] /v1/lectures/school/:id', () => {
    it('it should get all lectures for school (no dates provided)', (done) => {
      let classroom = new Classroom({name: 'Синий кит', volume: 100, location: 'Первый этаж'});
      let school1 = new School({name: 'Школа мобильной разработки', number_of_students: 50});
      let school2 = new School({name: 'Школа мобилього дизайна', number_of_students: 50});
      let promises = [school1.save(), school2.save(), classroom.save()];
      Promise.all(promises).then((data) => {
        let lecturePromises = [];

        for(let i = 1; i < 10; i++) {
          let lecture = new Lecture({
            name: `Распределенные вычисления №${i}`,
            date: new Date(`2017-07-0${i} 19:00`),
            classroom: classroom.id,
            school: [data[0]['_id'], data[1]['_id']],
            teacher: 'Васечкин'
          });
          lecturePromises.push(lecture.save());
        }

        return Promise.all(lecturePromises).then((data) => {
          chai.request(server)
              .get(`/v1/lectures/school/${school1.id}`)
              .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('success', true);
                res.body.should.have.property('message');
                res.body.message.should.be.an('array');
                res.body.message.length.should.be.eql(9);
                res.body.message.should.all.have.deep.property('[0].school[0]', school1.id);
                done();
              });
        });
      });
    });

    it('it should get all lectures for school (2 dates provided)', (done) => {
      let classroom = new Classroom({name: 'Синий кит', volume: 100, location: 'Первый этаж'});
      let school1 = new School({name: 'Школа мобильной разработки', number_of_students: 50});
      let school2 = new School({name: 'Школа мобилього дизайна', number_of_students: 50});
      let promises = [school1.save(), school2.save(), classroom.save()];
      Promise.all(promises).then((data) => {
        let lecturePromises = [];

        for(let i = 1; i < 10; i++) {
          let lecture = new Lecture({
            name: `Распределенные вычисления №${i}`,
            date: new Date(`2017-07-0${i} 19:00`),
            classroom: classroom.id,
            school: data[i%2]['_id'],
            teacher: 'Васечкин'
          });
          lecturePromises.push(lecture.save());
        }

        return Promise.all(lecturePromises).then((data) => {
          chai.request(server)
              .get(`/v1/lectures/school/${school1.id}?from=2017-07-01&to=2017-07-05`)
              .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('success', true);
                res.body.should.have.property('message');
                res.body.message.should.be.an('array');
                res.body.message.length.should.be.eql(2);
                res.body.message.should.all.have.deep.property('[0].school[0]', school1.id);
                done();
              });
        });
      });
    });

    it('it should get all lectures for school (from date provided)', (done) => {
      let classroom = new Classroom({name: 'Синий кит', volume: 100, location: 'Первый этаж'});
      let school1 = new School({name: 'Школа мобильной разработки', number_of_students: 50});
      let school2 = new School({name: 'Школа мобилього дизайна', number_of_students: 50});
      let promises = [school1.save(), school2.save(), classroom.save()];
      Promise.all(promises).then((data) => {
        let lecturePromises = [];

        for(let i = 1; i < 10; i++) {
          let lecture = new Lecture({
            name: `Распределенные вычисления №${i}`,
            date: new Date(`2017-07-0${i} 19:00`),
            classroom: classroom.id,
            school: data[i%2]['_id'],
            teacher: 'Васечкин'
          });
          lecturePromises.push(lecture.save());
        }

        return Promise.all(lecturePromises).then((data) => {
          chai.request(server)
              .get(`/v1/lectures/school/${school1.id}?from=2017-07-05`)
              .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('success', true);
                res.body.should.have.property('message');
                res.body.message.should.be.an('array');
                res.body.message.length.should.be.eql(2);
                res.body.message.should.all.have.deep.property('[0].school[0]', school1.id);
                done();
              });
        });
      });
    });

    it('it should get all lectures for school (to date provided)', (done) => {
      let classroom = new Classroom({name: 'Синий кит', volume: 100, location: 'Первый этаж'});
      let school1 = new School({name: 'Школа мобильной разработки', number_of_students: 50});
      let school2 = new School({name: 'Школа мобилього дизайна', number_of_students: 50});
      let promises = [school1.save(), school2.save(), classroom.save()];
      Promise.all(promises).then((data) => {
        let lecturePromises = [];

        for(let i = 1; i < 10; i++) {
          let lecture = new Lecture({
            name: `Распределенные вычисления №${i}`,
            date: new Date(`2017-07-0${i} 19:00`),
            classroom: classroom.id,
            school: data[i%2]['_id'],
            teacher: 'Васечкин'
          });
          lecturePromises.push(lecture.save());
        }

        return Promise.all(lecturePromises).then((data) => {
          chai.request(server)
              .get(`/v1/lectures/school/${school1.id}?to=2017-07-05`)
              .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('success', true);
                res.body.should.have.property('message');
                res.body.message.should.be.an('array');
                res.body.message.length.should.be.eql(2);
                res.body.message.should.all.have.deep.property('[0].school[0]', school1.id);
                done();
              });
        });
      });
    });

    it('it should return error if date is not valid', (done) => {
      let classroom = new Classroom({name: 'Синий кит', volume: 100, location: 'Первый этаж'});
      let school1 = new School({name: 'Школа мобильной разработки', number_of_students: 50});
      let school2 = new School({name: 'Школа мобилього дизайна', number_of_students: 50});
      let promises = [school1.save(), school2.save(), classroom.save()];
      Promise.all(promises).then((data) => {
        let lecturePromises = [];

        for(let i = 1; i < 10; i++) {
          let lecture = new Lecture({
            name: `Распределенные вычисления №${i}`,
            date: new Date(`2017-07-0${i} 19:00`),
            classroom: classroom.id,
            school: data[i%2]['_id'],
            teacher: 'Васечкин'
          });
          lecturePromises.push(lecture.save());
        }

        return Promise.all(lecturePromises).then((data) => {
          chai.request(server)
              .get(`/v1/lectures/school/${school1.id}?to=2017-07-0`)
              .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('success', false);
                res.body.should.have.property('error');
                res.body.error.should.be.a('object');
                res.body.error.should.have.property('message', 'There is issue with date to you\'ve provided');
                done();
              });
        });
      });
    });
  });

});
