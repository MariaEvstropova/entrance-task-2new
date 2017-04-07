var express = require('express');
var router = express.Router();

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
router.get('/lectures', function(req, res, next) {
  console.log(req.query);
  next();
}, function (req, res) {
  res.send('[GET] /lectures: Not implemented');
});
//Создать новую лекцию
router.post('/lectures', function (req, res) {
  res.send('[POST] /lectures: Not implemented');
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
router.get('/classrooms', function (req, res) {
  res.send('[DELETE] /classrooms/:id: Not implemented');
});
//Создать новую аудиторию
router.post('/classrooms', function (req, res) {
  res.send('[DELETE] /classrooms/:id: Not implemented');
});
//Изменить аудиторию
router.put('/classrooms/:id', function (req, res) {
  res.send('[DELETE] /classrooms/:id: Not implemented');
});
//Удалить аудиторию
router.delete('/classrooms/:id', function (req, res) {
  res.send('[DELETE] /classrooms/:id: Not implemented');
});

//Школы
//Печеречь всех школ
router.get('/schools', function (req, res) {
  res.send('[GET] /schools: Not implemented');
});
//Создать новую школу
router.post('/schools', function (req, res) {
  res.send('[POST] /schools: Not implemented');
});
//Изменить школу
router.put('/schools/:id', function (req, res) {
  res.send('[PUT] /schools/:id: Not implemented');
});
//Удалить школу
router.delete('/schools/:id', function (req, res) {
  res.send('[DELETE] /schools/:id: Not implemented');
});

module.exports = router;
