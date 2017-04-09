const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

//Базовые операции одинаковые для всех моделей вынесли в отдельный файл
const helper = require('./crudHelper');
const Classroom = require('../models/classroom');
const Lecture = require('../models/lecture');

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

/*
Перед обращением к базе данных необходимо удостовериться что если данные, которые нужно обновить.
Если запрос пустой - проводить поиск не будем.

@param {objectId} req.params.id
@param {String} req.body.name
@param {String} req.body.location
@param {Number} req.body.volume
*/
module.exports.edit_classroom = function(req, res) {
  //Обновляем только те поля, которые есть в запросе
  let update = {};
  if (req.body.name) {
    update.name = req.body.name;
  }
  if (req.body.volume) {
    update.volume = req.body.volume;
  }
  if (req.body.location) {
    update.location = req.body.location;
  }
  if (!update.name && !update.volume && !update.location) {
    return res.json({
      success: false,
      error: `Your request doens't contain params for udate. Params available for update: name, volume, location.`
    });
  }
  return (
    Classroom.findOneAndUpdate(
      {_id: req.params.id},
      update,
      {new: true}
    ).exec()
    .then((data) => {
      if (!data) {
        return res.json({
          success: false,
          error: `Can't update, classrom doesn't exist`
        });
      } else {
        return res.json({
          success: true,
          message: data
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

/*
Перед тем как удалять аудиторию, необходимо удостовериться, что в ней не планируется занятий.
Если в данной аудитории планируются лекции - возвращаем ошибку.

@param {objectId} req.params.id
*/
module.exports.delete_classroom = function(req, res) {
  return (
    Lecture.find({classroom: req.params.id}).exec()
    .then((data) => {
      if (data.length > 0) {
        return res.json({
          success: false,
          error: `Can not delete classroom. Change lectures to be able to delete: ${data}`
        });
      } else {
        Classroom.findOneAndRemove({_id: req.params.id}).exec()
        .then((data) => {
          if (!data) {
            return res.json({
              success: false,
              error: `No classroom with id = ${req.params.id} in database`
            });
          }
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
}
