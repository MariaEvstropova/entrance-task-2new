var mongoose = require('mongoose');

var Schema = mongoose.Schema;

/*
Используем встроенные в mongoose валидаторы.
Валидатор является pre('save') hook'ом и будет вызван при вызве Model.save().
Если валидации не будет пройдена, Model.save() вернет ошибку, указанную в непройденном валидаторе.
(http://mongoosejs.com/docs/validation.html, http://mongoosejs.com/docs/middleware.html)

Минимальная длина имени школы - 1 символ,
Максимальная длина имени школы - 300 символов,
Имя школы является обызательным.

Минимальное число студентов - 1,
Максимальное число студентов - 100 человек,
Число студентов обязательный параметр.
*/
var SchoolSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: [1, 'min length of the school\'s name = 1'],
      maxlength: [300, 'max length of the school\'s name = 300']
    },
    number_of_students: {
      type: Number,
      required: true,
      min: [1, 'min number of students = 1'],
      max: [100, 'max number of students = 100']
    }
  }
);

module.exports = mongoose.model('School', SchoolSchema);
