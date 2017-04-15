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

        return classroom.save();
      } else {
        throw new Error(`Classroom with name "${req.body.name}" exists`);
      }
    })
    .then((data) => {
      return res.json({
        success: true,
        message: data
      });
    })
    .catch((error) => {
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
      error: {
        message: `Your request doens't contain params for update. Params available for update: name, volume, location.`
      }
    });
  }
  return checkLecturesInClassroom(req.params.id)
  .then((data) => {
    if (data.success && update.volume) {
      let extraParams = {
        testVolume: update.volume
      }
      return helper.checkAllLecturesSpaceEnough(data.lectures, extraParams);
    }
    return {
      sucess: true
    }
  })
  .then(() => {
    return Classroom.findOneAndUpdate({_id: req.params.id}, update, {runValidators: true, new: true}).exec();
  })
  .then((data) => {
    return res.json({
      success: true,
      message: data
    });
  })
  .catch((error) => {
    return res.json({
      success: false,
      error: {
        message: error.message,
        errors: error.errors
      }
    });
  });
};

/*
Перед тем как удалять аудиторию, необходимо удостовериться, что в ней не планируется занятий.
Если в данной аудитории планируются лекции - возвращаем ошибку.

@param {objectId} req.params.id
*/
module.exports.delete_classroom = function(req, res) {
  return checkLecturesInClassroom(req.params.id)
  .then((data) => {
    if (data.success) {
      throw new Error(`Can not delete classroom. Change lectures to be able to delete: ${data.lectures.map((item) => {return item.name})}`);
    }
    return Classroom.findOneAndRemove({_id: req.params.id}).exec();
  })
  .then((data) => {
    return res.json({
      success: true,
      message: data
    });
  })
  .catch((error) => {
    return res.json({
      success: false,
      error: {
        message: error.message,
        errors: error.errors
      }
    });
  });
};

checkLecturesInClassroom = function(id) {
  return helper.checkItemExist(Classroom, id)
  .then((data) => {
    if (!data.success) {
      throw new Error(`No classroom with id = ${id} in database`);
    }
    return {
      success: true
    }
  })
  .then(() => {
    return Lecture.find({classroom: id}).exec()
  })
  .then((data) => {
    if (data.length > 0) {
      return {
        success: true,
        message: 'there are lectures',
        lectures: data
      }
    }
    return {
      success: false,
      message: 'no lectures',
      lectures: null
    }
  })
};
