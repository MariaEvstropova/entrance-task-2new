const express = require('express');
const router = express.Router();
const controller = require('../controllers/apiController');

router.get('/', function(req, res) {
    res.json({ message: 'welcome to api' });
});

//Лекции
//Перечень лекций для конкретной школы
router.get('/lectures/school/:id',  function(req, res, next) {
  console.log(req.query);
  next();
}, function(req, res) {
  res.send('[GET] /lectures/school/:id: Not implemented');
});
//Перечень лекций для конкретной аудитории
router.get('/lectures/classroom/:id',  function(req, res, next) {
  console.log(req.query);
  next();
}, function(req, res) {
  res.send('[GET] /lectures/classroom/:id: Not implemented');
});

//Печеречь всех лекций
router.get('/lectures', controller.get_all_lectures);
//Получить данные лекции по id
router.get('/lectures/:id', controller.get_lecture_byId);
//Создать новую лекцию
router.post('/lectures', function (req, res) {
  res.send('[POST] /lectures/: Not implemented');
});
//Изменить лекцию
router.put('/lectures/:id', function (req, res) {
  res.send('[PUT] /lectures/:id: Not implemented');
});
//Удалить лекцию
router.delete('/lectures/:id', function (req, res) {
  res.send('[DELETE] /lectures/:id: Not implemented');
});

//Аудитории
//Печеречь всех аудиторий
router.get('/classrooms', controller.get_all_classrooms);
//Получить данные аудитории по id
router.get('/classrooms/:id', controller.get_classroom_byId);
//Создать новую аудиторию
router.post('/classrooms', controller.create_classroom);
//Изменить аудиторию
router.put('/classrooms/:id', controller.edit_classroom);
//Удалить аудиторию
router.delete('/classrooms/:id', function (req, res) {
  res.send('[DELETE] /classrooms/:id: Not implemented');
});

//Школы
//Печеречь всех школ
router.get('/schools', controller.get_all_schools);
//Получить данные школы по id
router.get('/schools/:id', controller.get_school_byId);
//Создать новую школу
router.post('/schools', controller.create_school);
//Изменить школу
router.put('/schools/:id', controller.edit_school);
//Удалить школу
router.delete('/schools/:id', function (req, res) {
  res.send('[DELETE] /schools/:id: Not implemented');
});

module.exports = router;
