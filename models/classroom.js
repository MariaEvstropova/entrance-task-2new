var mongoose = require('mongoose');

var Schema = mongoose.Schema;

/*
Используем встроенные в mongoose валидаторы.
Валидатор является pre('save') hook'ом и будет вызван при вызве Model.save().
Если валидации не будет пройдена, Model.save() вернет ошибку, указанную в непройденном валидаторе.
(http://mongoosejs.com/docs/validation.html, http://mongoosejs.com/docs/middleware.html)

Минимальная длина имени аудитории - 1 символ,
Максимальная длина имени аудитории - 300 символов,
Имя аудитории является обызательным.

Местоположение является обязательным параметром.
Валидация не используется.
Значение по умолчанию будет использовано в том случае, если иное не введено.

Минимальная вместимость аудитории - 100 (т.к. максимальное число студентов в школе составляет 100 человек),
Максимальное вместимость аудитории - 1000 человек,
Вместимость обязательный параметр.
*/
var ClassroomSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: [1, 'min length of the classroom\'s name = 1'],
      maxlength: [300, 'max length of the classroom\'s name = 300']
    },
    location: {
      type: String,
      required: true,
      default: 'Для уточнения местоположения аудитории, обратитесь на стойку регистрации. Спасибо!'
    },
    volume: {
      type: Number,
      required: true,
      min: [100, 'min volume of classroom = 100'],
      max: [1000, 'max volume of classroom = 1000']
    }
  }
);

module.exports = mongoose.model('Classroom', ClassroomSchema);
