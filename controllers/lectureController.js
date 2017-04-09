const mongoose = require('mongoose');
const moment = require('moment');
mongoose.Promise = global.Promise;

//Базовые операции одинаковые для всех моделей вынесли в отдельный файл
const helper = require('./crudHelper');

//Определим модели, с которыми будем работать
const Classroom = require('../models/classroom');
const School = require('../models/school');
const Lecture = require('../models/lecture');

//Лекции
module.exports.get_all_lectures = function(req, res) {
  return Lecture.find({})
        .populate({path: 'classroom', model: Classroom})
        .populate({path: 'school', model: School})
        .exec()
        .then((data) => {
          res.json({
            success: true,
            data: data
          })
        }, (error) => {
          res.json({
            success: false,
            error: error
          });
        });
};
module.exports.get_lecture_byId = function(req, res) {
  return helper.get_item_byId(Lecture, req, res);
};
/*
Перед тем как добавить лкцию нужно проверить:
1) нет ли лекции с такими же параметрами в бд
2) есть ли школа с указанным именем
3) есть ли аудитория с указанным именем

@param {String} req.body.lectureName
@param {String} req.body.lectureDate - дата ожидается в формате: гггг-мм-дд
@param {String} req.body.lectureTime - время ожидается в формате чч(24 часа)-мм
@param {String} req.body.classroomName
@param {String} req.body.schoolName[]
@param {String} req.body.teacher
*/
module.exports.create_lecture = function(req, res) {
  //Для поиска аудитории необходимо её имя, если имени нет - вернем ошибку
  if (!req.body.classroomName) {
    return res.json({
      success: false,
      error: 'You request must contain classroomName'
    });
  }
  //Для поиска школы необходимо её имя, если имени нет - вернем ошибку
  if (!req.body.schoolName || req.body.schoolName.length == 0) {
    return res.json({
      success: false,
      error: 'You request must contain schoolName'
    });
  }
  let promises = [];
  promises.push(Classroom.findOne({name: req.body.classroomName}).exec());
  req.body.schoolName.forEach((item) => {
    promises.push(School.findOne({name: item}).exec());
  });
  return (
    Promise.all(promises)
    .then((data) => {
      for (let i = 0; i < data.length; i++) {
        if (!data[i] && i == 0) {
          return res.json({
            success: false,
            error: `There is no classroom with name ${req.body.classroomName} in database`
          });
        } else if (!data[i]) {
          return res.json({
            success: false,
            error: `There is no school with name ${req.body.schoolName[i-1]} in database`
          });
        }
      }
      date = moment(`${req.body.lectureDate} ${req.body.lectureTime}:00`);
      if (!date.isValid()) {
        return res.json({
          success: false,
          error: 'There is issue with date and time you\'ve provided'
        });
      }
      let id = data.map((item) => {return item['_id']});
      let lecture = {
        name: req.body.lectureName,
        date: date,
        classroom: id[0],
        school: id.slice(1),
        teacher: req.body.teacher
      };
      return (
        Lecture.find(lecture).exec().then((data) => {
          if (data.length !== 0) {
            return res.json({
              success: false,
              error: 'Lecture with privided params is already exist'
            });
          } else {
            let lecture = new Lecture({
              name: req.body.lectureName,
              date: date,
              classroom: id[0],
              school: id.slice(1),
              teacher: req.body.teacher
            });
            lecture.save().then((data) => {
              return res.json({
                success: true,
                message: data
              });
            }, (error) => {
              return res.json({
                success: false,
                error: error
              });
            });
          }
        }, (error) => {
          return res.json({
            success: false,
            error: error
          });
        })
      );
    }, (error) => {
      return res.json({
        success: false,
        error: error
      });
    }, (error) => {
      return res.json({
        success: false,
        error: error
      });
    })
  );
};
