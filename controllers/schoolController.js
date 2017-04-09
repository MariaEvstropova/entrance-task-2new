const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

//Базовые операции одинаковые для всех моделей вынесли в отдельный файл
const helper = require('./crudHelper');
const School = require('../models/school');

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
          })
        );
      } else {
          throw new Error(`School with name "${req.body.name}" exists`);
      }
    }).catch((error) => {
      return res.json({
        success: false,
        error: {
          message: error.message,
          errors: error.errors
        }
      });
    })
  );
};

/*
Перед обращением к базе данных необходимо удостовериться что если данные, которые нужно обновить.
Если запрос пустой - проводить поиск не будем.

@param {objectId} req.params.id
@param {String} req.body.name
@param {String} req.body.students
*/
module.exports.edit_school = function(req, res) {
  //Обновляем только те поля, которые есть в запросе
  let update = {};
  if (req.body.name) {
    update.name = req.body.name;
  }
  if (req.body.students) {
    update.number_of_students = req.body.students;
  }
  if (!update.name && !update.number_of_students) {
    return res.json({
      success: false,
      error: `Your request doens't contain params for udate. Params available for update: name, students.`
    });
  }
  return (
    School.findOneAndUpdate(
      {_id: req.params.id},
      update,
      {new: true}
    ).exec()
    .then((data) => {
      if (!data) {
        throw new Error(`Can't update, school doesn't exist`);
      } else {
        return res.json({
          success: true,
          message: data
        });
      }
    }).catch((error) => {
      return res.json({
        success: false,
        error: error.message
      });
    })
  );
};
