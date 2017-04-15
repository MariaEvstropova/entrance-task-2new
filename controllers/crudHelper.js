const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const Classroom = require('../models/classroom');
const School = require('../models/school');
const Lecture = require('../models/lecture');

module.exports.get_all_helper = function(model, req, res) {
  return model.find({}).exec()
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

module.exports.get_item_byId = function(model, req, res) {
  let id = req.params.id;
  return model.findById(id).exec()
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

module.exports.checkItemExist = function(model, id) {
  return model.findOne({_id: id}).exec()
  .then((data) => {
    if (data) {
      return {
        success: true,
        message: 'exist',
        item: data
      }
    }
    return {
      success: false,
      message: 'not exist'
    }
  });
};

/*
Метод проверияет достаточно ли места для школ с id[] = schoolsId в аудитории с id = classroomId.
Метод принимает дополнительные параметры extraParams, которые могут содержать:
1) testVolume - для проверки нового значения объема аудитории
2) testStudent и testSchoolId - для проверки нового значения number_of_students для аудитории с id = testSchoolId
*/
module.exports.checkSpaceEnough = function(classroomId, schoolsId, extraParams) {
  let promises = [];
  let classroomVolume = 0;
  let volume = 0;
  let audience = 0;

  let testVolume;
  let testStudent;
  let testSchoolId;
  if (extraParams) {
    testVolume = extraParams.testVolume;
    testStudent = extraParams.testStudent;
    testSchoolId = extraParams.schoolId;
  }

  //Создаем массив промизов для поиска всех указанных на лекции школ
  schoolsId.forEach((schoolId) => {
    promises.push(School.findOne({_id: schoolId}).exec());
  });
  return Classroom.findOne({_id: classroomId}).exec()
  .then((classroom) => {
    classroomVolume = classroom.volume;
    //Если указан testVolume - будем проверять его
    volume = testVolume || classroomVolume;
    return Promise.all(promises);
  })
  .then((schools) => {
    schools.forEach((school) => {
      //Если у нас есть школа, для которой надо проверить новое число студентов, то подставим его
      if (!!testSchoolId && !!testStudent && school.id == testSchoolId) {
        audience = audience + testStudent;
      } else {
        audience = audience + school.number_of_students;
      }
    });
    if (volume < audience) {
      let message = `Too many students, volume of classroom = ${classroomVolume}`;
      let messageVolume = testVolume ? `, volume to test = ${testVolume}` : '';
      let messageStudents = testStudent ? `, audience = ${audience}, number of students to test = ${testStudent}` : ''
      throw new Error(message + messageVolume + messageStudents);
    }
    return {
      success: true
    }
  });
};

module.exports.checkAllLecturesSpaceEnough = function(lectures, extraParams) {
  let promises = [];
  lectures.forEach((lecture) => {
    promises.push(this.checkSpaceEnough(lecture.classroom, lecture.school, extraParams));
  });
  return Promise.all(promises)
  .then((data) => {
    return {
      success: true
    }
  });
};
