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
        }).catch((error) => {
          return res.json({
            success: false,
            error: {
              message: error.message,
              errors: error.errors
            }
          });
        });
};
module.exports.get_lecture_byId = function(req, res) {
  return Lecture.findOne({_id: req.params.id})
        .populate({path: 'classroom', model: Classroom})
        .populate({path: 'school', model: School})
        .exec()
        .then((data) => {
          res.json({
            success: true,
            data: data
          })
        }).catch((error) => {
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
Перед тем как добавить лкцию нужно проверить:
1) нет ли лекции с таким же названием в бд
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
      error: {
        message :'You request must contain classroomName'
      }
    });
  }
  //Для поиска школы необходимо её имя, если имени нет - вернем ошибку
  if (!req.body.schoolName || req.body.schoolName.length == 0) {
    return res.json({
      success: false,
      error: {
        message :'You request must contain schoolName'
      }
    });
  }
  //Проверим дату
  let date = moment(`${req.body.lectureDate} ${req.body.lectureTime}:00`, moment.ISO_8601);
  if (!date.isValid()) {
    return res.json({
      success: false,
      error: {
        message :"There is issue with date and time you've provided"
      }
    });
  }
  //Проверим нет ли леции с таким нзванием в базе данных
  Lecture.find({name: req.body.lectureName}).exec()
  .then((data) => {
    if (data.length !== 0) {
      throw new Error('Lecture with provided name is already exist');
    }
    //Проверить есть ли все указанные id для школа и аудитории в базе данных
    let promises = [];
    promises.push(Classroom.findOne({name: req.body.classroomName}).exec());
    req.body.schoolName.forEach((item) => {
      promises.push(School.findOne({name: item}).exec());
    });
    return Promise.all(promises)
  })
  .then((data) => {
    //Promise.all сохранят в ответе последовательность запросов => первым будет ответ для аудитории
    for (let i = 0; i < data.length; i++) {
      if (!data[i] && i == 0) {
        throw new Error(`There is no classroom with name ${req.body.classroomName} in database`);
      } else if (!data[i]) {
        throw new Error(`There is no school with name ${req.body.schoolName[i-1]} in database`);
      }
    }
    let id = data.map((item) => {return item['_id']});
    //Проверим вместимость аудитории
    let volume = data[0]['volume'];
    let audience = 0;
    for (let i = 1; i < data.length; i++) {
      audience += data[i]['number_of_students'];
    }
    if (volume < audience) {
      throw new Error(`Too many students, volume of classroom = ${volume}`);
    }
    let lecture = new Lecture({
      name: req.body.lectureName,
      date: date,
      classroom: id[0],
      school: id.slice(1),
      teacher: req.body.teacher
    });
    return lecture.save();
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

checkNameAvailable = function(name) {
  Lecture
      .find({name: name}).exec()
      .then((data) => {
        //Если уже есть результаты поиска, значит имя занято
        if (data.length > 0) {
          throw new Error('Lecture with provided name is already exist');
        }
        return {
          success: true
        }
      });
};

checkClassroomAvailable = function(classroom, date) {
  Lecture
      .find({
        classroom: classroom,
        date: {
          $gd: moment(date).subtract(3, 'hours'),
          $lt: moment(date).add(3, 'hours')
        }
      }).exec()
      .then((data) => {
        if (data.length > 0) {
          throw new Error(`Classroom id = ${classroom} is not available at time = ${date}`);
        }
        return {
          success: true
        }
      });
};

checkSchoolAvailable = function(school, date) {
  Lecture
      .find({
        school: school,
        date: {
          $gd: moment(date).subtract(3, 'hours'),
          $lt: moment(date).add(3, 'hours')
        }
      }).exec()
      .then((data) => {
        if (data.length > 0) {
          throw new Error(`School id = ${school} is not available at time = ${date}`);
        }
        return {
          success: true
        }
      });
};

checkAllSchoolsAvailable = function(schoolsArray, date) {
  let promises = [];
  schoolsArray.forEach((school) => {
    promises.push(checkSchoolAvailable(school, date));
  });
  Promise.all(promises).then(() => {
    return {
      success: true
    }
  });
};

checkSpaceEnough = function(classroomId, schoolsId) {
  let promises = [];
  schoolsId.forEach((schoolId) => {
    promises.push(School.findOne({_id: schoolId}).exec());
  });
  Classroom.findOne({_id: classroomId}).exec().then((classroom) => {
    let volume = classroom.volume;
    let audience = 0;
    return Promise.all(promises).then((schools) => {
      schools.forEach((school) => {
        audience = audience + school.number_of_students;
      });
      if (volume < audience) {
        throw new Error(`Too many students, volume of classroom = ${volume}`);
      }
      return {
        success: true
      }
    });
  });

};