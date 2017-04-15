const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

//Базовые операции одинаковые для всех моделей вынесли в отдельный файл
const helper = require('./crudHelper');
const School = require('../models/school');
const Lecture = require('../models/lecture');

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
        return school.save();
      } else {
        throw new Error(`School with name "${req.body.name}" exists`);
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
      error: `Your request doens't contain params for update. Params available for update: name, students.`
    });
  }
  return checkLecturesForSchool(req.params.id)
  .then((data) => {
    if (data.success) {
      let extraParams = {
        testStudent: req.body.students,
        schoolId: req.params.id
      };
      return helper.checkAllLecturesSpaceEnough(data.lectures, extraParams);
    }
    return {
      success: true
    }
  })
  .then(() => {
    return School.findOneAndUpdate({_id: req.params.id}, update, {runValidators: true, new: true}).exec();
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
Перед тем как удалять школу, необходимо удостовериться, что для неё не планируется занятий.
Если для школы планируются лекции - возвращаем ошибку.

@param {objectId} req.params.id
*/
module.exports.delete_school = function(req, res) {
  return checkLecturesForSchool(req.params.id)
  .then((data) => {
    if (data.success) {
      throw new Error(`Can not delete school. Change lectures to be able to delete: ${data.lectures.map((item) => {return item.name})}`);
    }
    return School.findOneAndRemove({_id: req.params.id}).exec();
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

checkLecturesForSchool = function(id) {
  return helper.checkItemExist(School, id)
  .then((data) => {
    if (!data.success) {
      throw new Error(`No school with id = ${id} in database`);
    }
    return {
      success: true
    }
  })
  .then((data) => {
    return Lecture.find({school: id}).exec();
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
