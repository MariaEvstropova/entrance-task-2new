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
