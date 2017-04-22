const mongoose = require('mongoose');
const moment = require('moment');
mongoose.Promise = global.Promise;

//Базовые операции одинаковые для всех моделей вынесли в отдельный файл
const helper = require('./crudHelper');

//Определим модели, с которыми будем работать
const Classroom = require('../models/classroom');
const School = require('../models/school');
const Lecture = require('../models/lecture');

//Возвращает все лекции
module.exports.get_all_lectures = function(req, res) {
  //Возвращаем данные о школах и аудиториях в развернутом виде, для этого используем mongoose populate
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

//Возвращает лекицю по id
module.exports.get_lecture_byId = function(req, res) {
  //Возвращаем данные о школах и аудиториях в развернутом виде, для этого используем mongoose populate
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
@param {String} req.body.name
@param {String} req.body.date - дата ожидается в формате: гггг-мм-дд чч-мм
@param {String} req.body.classroom - id
@param {String} req.body.schools[] - id[]
@param {String} req.body.teacher
*/
module.exports.create_lecture = function(req, res) {
  let date = moment(req.body.date, moment.ISO_8601);
  return checkPostParams(req.body.classroom, req.body.schools)
  .then(() => {
    return checkDateisValid(req.body.date)
  }).then(() => {
    return checkNameAvailable(req.body.name);
  })
  .then(() => {
    return checkClassroomExist(req.body.classroom);
  })
  .then(() => {
    return checkAllSchoolsExist(req.body.schools);
  })
  .then(() => {
    return checkClassroomAvailable(req.body.classroom, date);
  })
  .then(() => {
    return checkAllSchoolsAvailable(req.body.schools, date);
  })
  .then(() => {
    return helper.checkSpaceEnough(req.body.classroom, req.body.schools);
  })
  .then((data) => {
    if (data.success) {
      let lecture = new Lecture({
        name: req.body.name,
        date: date,
        classroom: req.body.classroom,
        school: req.body.schools,
        teacher: req.body.teacher
      });
      return lecture.save();
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
  });
};

/*
Возможные поля для изменения
@param {String} req.body.name
@param {String} req.body.date - дата ожидается в формате: гггг-мм-дд чч-мм
@param {String} req.body.classroom - id
@param {String} req.body.schools[] - id[]
@param {String} req.body.teacher
*/
module.exports.edit_lecture = function(req, res) {
  //Обновляем только те поля, которые есть в запросе
  let update = {};
  let lecture;
  if (req.body.name) {
    update.name = req.body.name;
  }
  if (req.body.date) {
    update.date = req.body.date;
  }
  if (req.body.classroom) {
    update.classroom = req.body.classroom;
  }
  if (req.body.schools) {
    update.school = req.body.schools;
  }
  if (req.body.teacher) {
    update.teacher = req.body.teacher;
  }
  if (!update.name && !update.date && !update.classroom && (!update.school || !Array.isArray(update.school) || update.school.length == 0) && !update.teacher) {
    return res.json({
      success: false,
      error: {
        message: `Your request doens't contain params for update. Params available for update: name, date, classroom, schools, teacher.`
      }
    });
  }
  //Если планируем обновлять школу, но в запросе указали одну и ту же школу несколько раз - вернуть ошибку
  if (update.school && !checkShoolIdUnique(update.school)) {
    return res.json({
      success: false,
      error: {
        message: 'Schools in array must be unique'
      }
    });
  }
  //Уточнить есть ли лекция с таким id
  return helper.checkItemExist(Lecture, req.params.id)
  .then((data) => {
    if (!data.success) {
      throw new Error(`Lecture with id = "${req.params.id}" does not exist`)
    }
    return {
      success: true,
      data: data
    }
  })
  .then((data) => {
    //После поиска аудитории сохраним её в переменной lecture, определенной выше
    lecture = data.data.item;
    //Если планируем изменять название - проверить не занято ли новое название
    if (update.name) {
      return checkNameAvailable(update.name);
    }
    return {
      success: true
    }
  })
  .then(() => {
    if (update.date) {
      return checkDateisValid(update.date);
    }
    return {
      success: true
    }
  })
  .then(() => {
    // Если планируется изменение даты, необходимо удостовериться что аудитория и школы свободны в этот день и час.
    if (update.date) {
      update.date = moment(update.date, moment.ISO_8601);
    }
    let promises = [];

    if (update.classroom) {
      if (update.date) {
        //Проверить свободна ли "новая" аудитория в "новый" день
        promises.push(checkClassroomAvailable(update.classroom, update.date));
      } else {
        //Проверить свободна ли новая аудитория в "старый" день
        promises.push(checkClassroomAvailable(update.classroom, lecture.date));
      }
    } else if (update.date) {
      //Проверить свободна ли "старая" аудитория в "новый" день
      promises.push(checkClassroomAvailable(lecture.classroom, update.date));
    }

    if (update.school) {
      if (update.date) {
        //Проверить свободны ли все школы в "новый" день
        promises.push(checkAllSchoolsAvailable(update.school, update.date));
      } else {
        /*
        Если дата не меняется, то проверить свободны ли все школы нужно только для тех школ
        которых не на лекции сейчас.
        То есть нужно выделить разность массивов и проверить только их.
        */
        let schools = update.school.filter((school) => {
          return lecture.school.indexOf(school) == -1;
        });
        promises.push(checkAllSchoolsAvailable(schools, lecture.date));
      }
    } else if (update.date) {
      //Проверить свободны ли все школы в "новый" день
      promises.push(checkAllSchoolsAvailable(lecture.school, update.date));
    }

    //Проверить всем ли на лекции хватит посадочных мест
    if (update.classroom && update.school) {
      promises.push(helper.checkSpaceEnough(update.classroom, update.school));
    } else if (update.classroom) {
      promises.push(helper.checkSpaceEnough(update.classroom, lecture.school));
    } else if (update.school) {
      promises.push(helper.checkSpaceEnough(lecture.classroom, update.school));
    }

    return Promise.all(promises);
  })
  .then(() => {
    /*
    Все проверки успешно выполнены, можно обновлять.
    При обновлении запускаем валидаторы для mongoose schema и возвращаем новое значение.
    */
    return Lecture.findOneAndUpdate({_id: req.params.id}, update, {runValidators: true, new: true}).exec();
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

module.exports.remove_lecture = function(req, res) {
  //Проверить есть ли лекция с таким id
  return helper.checkItemExist(Lecture, req.params.id)
  .then((data) => {
    if (!data.success) {
      throw new Error(`No lecture with id = ${req.params.id} in database`)
    }
    return Lecture.findOneAndRemove({_id: req.params.id}).exec();
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
@param {String} req.param.id
@param {String} req.query.from - дата ожидается в формате: гггг-мм-дд
@param {String} req.query.to - дата ожидается в формате: гггг-мм-дд
*/
module.exports.get_lectures_for_classroom = function(req, res) {
  /*
  Т.к. валидными считаются запросы не содержащие from и to,
  запросы содержащие только один из параметров,
  запросы содержащие ода параметра,
  создадим пустую переменную find, в которую потом запишем все что пришло в запросе
  */
  let dateFrom = req.query.from;
  let dateTo = req.query.to;
  let find = {};
  find.classroom = req.params.id;
  let date;

  //Проверим все ли пришедшие даты валидны, если нет - поймаем ошибку и вернем с ней response
  try {
    date = createDateParamsForFind(dateFrom, dateTo);
  } catch (error) {
    return res.json({
      success: false,
      error: {
        message: error.message
      }
    });
  }
  if (date['$gte'] || date['$lte']) {
    //Если в запросе пришел 1 или 2 валидных параметра для фильтрации по дате, запишем их в find
    find.date = date;
  }

  return Lecture.find(find)
  .populate({path: 'classroom', model: Classroom})
  .populate({path: 'school', model: School})
  .exec()
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
@param {String} req.param.id
@param {String} req.query.from - дата ожидается в формате: гггг-мм-дд
@param {String} req.query.to - дата ожидается в формате: гггг-мм-дд
*/
module.exports.get_lectures_for_school = function(req, res) {
  /*
  Т.к. валидными считаются запросы не содержащие from и to,
  запросы содержащие только один из параметров,
  запросы содержащие ода параметра,
  создадим пустую переменную find, в которую потом запишем все что пришло в запросе
  */
  let dateFrom = req.query.from;
  let dateTo = req.query.to;
  let find = {};
  find.school = req.params.id;
  let date;

  //Проверим все ли пришедшие даты валидны, если нет - поймаем ошибку и вернем с ней response
  try {
    date = createDateParamsForFind(dateFrom, dateTo);
  } catch (error) {
    return res.json({
      success: false,
      error: {
        message: error.message
      }
    });
  }
  if (date['$gte'] || date['$lte']) {
    //Если в запросе пришел 1 или 2 валидных параметра для фильтрации по дате, запишем их в find
    find.date = date;
  }

  return Lecture.find(find)
  .populate({path: 'classroom', model: Classroom})
  .populate({path: 'school', model: School})
  .exec()
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
  return Lecture
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
  /*
  Для того, чтобы определить свободна ли аудитория в данное время произведем поиск по всем лекция для данной аудитории.
  Временной интервал зададим +/- 3 часа (т.к. полагаем что 1 лекция идет < 3 часов)
  */
  return Lecture
      .find({
        classroom: classroom,
        date: {
          $gte: moment(date).subtract(3, 'hours'),
          $lt: moment(date).add(3, 'hours')
        }
      }).exec()
      .then((data) => {
        if (data.length > 0) {
          throw new Error(`Classroom id = ${classroom} is not available at time = ${date.toISOString()}`);
        }
        return {
          success: true
        }
      });
};

checkSchoolAvailable = function(school, date) {
  /*
  Для того, чтобы определить свободна ли школа в данное время произведем поиск по всем лекция для данной школы.
  Временной интервал зададим +/- 3 часа (т.к. полагаем что 1 лекция идет < 3 часов)
  */
  return Lecture
      .find({
        school: school,
        date: {
          $gte: moment(date).subtract(3, 'hours'),
          $lt: moment(date).add(3, 'hours')
        }
      }).exec()
      .then((data) => {
        if (data.length > 0) {
          throw new Error(`School id = ${school} is not available at time = ${date.toISOString()}`);
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
  return Promise.all(promises).then(() => {
    return {
      success: true
    }
  });
};

checkPostParams = function(classroom, schools) {
  return new Promise((resolve, reject) => {
    if (!classroom) {
      reject({
        message: 'Classroom id is incorrect'
      });
    }
    if (!schools || schools.length == 0) {
      reject({
        message: 'Schools array is empty'
      });
    }
    //Некорректными считаются данные в которых одна школа повторяется более 1 раза
    if (!checkShoolIdUnique(schools)) {
      reject({
        message: 'Schools in array must be unique'
      });
    }
    resolve({
      success: true
    })
  });
};

checkDateisValid = function(lectureDate) {
  return new Promise((resolve, reject) => {
    let date = moment(lectureDate, moment.ISO_8601);
    if (!date.isValid()) {
      throw new Error('There is issue with date and time you\'ve provided');
    }
    resolve(
      {
        success: true,
        date: date
      }
    );
  });
};

checkClassroomExist = function(id) {
  return helper.checkItemExist(Classroom, id)
  .then((data) => {
    if (!data.success) {
      throw new Error(`There is no classroom with id = ${id} in database`);
    }
    return {
      success: true
    };
  });
};

checkSchoolExist = function(id) {
  return helper.checkItemExist(School, id)
  .then((data) => {
    if (!data.success) {
      throw new Error(`There is no school with id = ${id} in database`);
    }
    return {
      success: true
    };
  });
};

checkAllSchoolsExist = function(schoolsId) {
  let promises = [];
  schoolsId.forEach((id) => {
    promises.push(checkSchoolExist(id));
  });
  return Promise.all(promises).then(() => {
    return {
      success: true
    }
  });
};

checkShoolIdUnique = function(schools) {
  let unique = true;
  for (let i = 0; i < schools.length - 1; i++) {
    for (let j = i + 1; j < schools.length; j++) {
      if (schools[i] == schools[j]) {
        unique = false;
      }
      if (!unique) {break;}
    }
    if (!unique) {break;}
  }
  return unique;
};

createDateParamsForFind = function(dateFrom, dateTo) {
  let find = {};
  if (dateFrom || dateTo) {
    if (dateFrom) {
      let date = moment(dateFrom, moment.ISO_8601);
      if (!date.isValid()) {
        throw new Error('There is issue with date from you\'ve provided');
      }
      find['$gte'] = date;
    }
    if (dateTo) {
      let date = moment(dateTo, moment.ISO_8601);
      if (!date.isValid()) {
        throw new Error('There is issue with date to you\'ve provided')
      }
      find['$lte'] = date;
    }
  }
  return find;
};
