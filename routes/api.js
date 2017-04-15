const express = require('express');
const router = express.Router();
const schoolController = require('../controllers/schoolController');
const classroomController = require('../controllers/classroomController');
const lectureController = require('../controllers/lectureController');

router.get('/', function(req, res) {
    res.json({ message: 'welcome to api' });
});

//Лекции
//Перечень лекций для конкретной школы
router.get('/lectures/school/:id', lectureController.get_lectures_for_school);
//Перечень лекций для конкретной аудитории
router.get('/lectures/classroom/:id', lectureController.get_lectures_for_classroom);

//Печеречь всех лекций
router.get('/lectures', lectureController.get_all_lectures);
//Получить данные лекции по id
router.get('/lectures/:id', lectureController.get_lecture_byId);
//Создать новую лекцию
router.post('/lectures', lectureController.create_lecture);
//Изменить лекцию
router.put('/lectures/:id', lectureController.edit_lecture);
//Удалить лекцию
router.delete('/lectures/:id', lectureController.remove_lecture);

//Аудитории
//Печеречь всех аудиторий
router.get('/classrooms', classroomController.get_all_classrooms);
//Получить данные аудитории по id
router.get('/classrooms/:id', classroomController.get_classroom_byId);
//Создать новую аудиторию
router.post('/classrooms', classroomController.create_classroom);
//Изменить аудиторию
router.put('/classrooms/:id', classroomController.edit_classroom);
//Удалить аудиторию
router.delete('/classrooms/:id', classroomController.delete_classroom);

//Школы
//Печеречь всех школ
router.get('/schools', schoolController.get_all_schools);
//Получить данные школы по id
router.get('/schools/:id', schoolController.get_school_byId);
//Создать новую школу
router.post('/schools', schoolController.create_school);
//Изменить школу
router.put('/schools/:id', schoolController.edit_school);
//Удалить школу
router.delete('/schools/:id', schoolController.delete_school);

module.exports = router;
