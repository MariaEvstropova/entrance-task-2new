const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

//Базовые операции одинаковые для всех моделей вынесли в отдельный файл
const helper = require('./crudHelper');

//Определим модели, с которыми будем работать
const Classroom = require('../models/classroom');
const School = require('../models/school');
const Lecture = require('../models/lecture');

//Лекции
module.exports.get_all_lectures = function(req, res) {
  return helper.get_all_helper(Lecture, req, res);
};
module.exports.get_lecture_byId = function(req, res) {
  return helper.get_item_byId(Lecture, req, res);
};

//Аудитории
module.exports.get_all_classrooms = function(req, res) {
  return helper.get_all_helper(Classroom, req, res);
};
module.exports.get_classroom_byId = function(req, res) {
  return helper.get_item_byId(Classroom, req, res);
};
/*
Перед сохранением аудитории проверим есть ли в базе данных аудитория с таким названием.
Если есть - вернем ошибку.

@param {String} req.body.name
@param {String} req.body.location
@param {Number} req.body.volume
*/
module.exports.create_classroom = function(req, res) {
  return (
    Classroom.findOne({name: req.body.name}).exec()
    .then((data) => {
      if (!data) {
        let classroom = new Classroom({
          name: req.body.name,
          location: req.body.location,
          volume: req.body.volume
        });

        return (
          classroom.save().then((data) => {
            return res.json({
              success: true,
              message: data
            });
          }, (error) => {
            return res.json({
              success: false,
              error: error
            });
          })
        );
      } else {
        return res.json({
          success: false,
          error: `Classroom with name "${req.body.name}" exists`
        });
      }
    }, (error) => {
      return res.json({
        success: false,
        error: error
      });
    })
  );
};

//Школы
module.exports.get_all_schools = function(req, res) {
  return helper.get_all_helper(School, req, res);
};
module.exports.get_school_byId = function(req, res) {
  return helper.get_item_byId(School, req, res);
};
/*
Перед сохранением школы проверим есть ли в базе данных школа с таким названием.
Если есть - вернем ошибку.

@param {String} req.body.name
@param {String} req.body.students
*/
module.exports.create_school = function(req, res) {
  return (
    School.findOne({name: req.body.name}).exec()
    .then((data) => {
      if (!data) {
        let school = new School({
          name: req.body.name,
          number_of_students: req.body.students
        });

        return (
          school.save().then((data) => {
            return res.json({
              success: true,
              message: data
            });
          }, (error) => {
            return res.json({
              success: false,
              error: error
            });
          })
        );
      } else {
        return res.json({
          success: false,
          error: `School with name "${req.body.name}" exists`
        });
      }
    }, (error) => {
      return res.json({
        success: false,
        error: error
      });
    })
  );
};
