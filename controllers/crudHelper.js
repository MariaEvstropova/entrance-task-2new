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
        message: 'exist'
      }
    }
    return {
      success: false,
      message: 'not exist'
    }
  });
};

module.exports.checkSpaceEnough = function(classroomId, schoolsId, testVolume) {
  let promises = [];
  let classroomVolume = 0;
  let volume = 0;
  let audience = 0;
  schoolsId.forEach((schoolId) => {
    promises.push(School.findOne({_id: schoolId}).exec());
  });
  return Classroom.findOne({_id: classroomId}).exec()
  .then((classroom) => {
    classroomVolume = classroom.volume;
    volume = testVolume || classroomVolume;
    return Promise.all(promises);
  })
  .then((schools) => {
    schools.forEach((school) => {
      audience = audience + school.number_of_students;
    });
    if (volume < audience) {
      throw new Error(`Too many students, volume of classroom = ${classroomVolume}${testVolume ? `, volume to test = ${testVolume}` : ''}`);
    }
    return {
      success: true
    }
  });
};
