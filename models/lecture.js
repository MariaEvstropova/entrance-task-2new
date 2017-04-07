var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var LectureSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: [1, 'min length of the lecture\'s name = 1'],
      maxlength: [1000, 'max length of the lecture\'s name = 1000']
    },
    date: {
      type: Date,
      required: true,
      validate: {
        //Валидатор для даты - лекция должна быть в будущем
        //@TODO уточнить валидатор
        validator: function(date) {
          var now = Date.now();
          return (date - now) > 0;
        }
      }
    },
    classroom: {
      type: Schema.ObjectId,
      ref: "classroom",
      required: true
    },
    school: [{
      type: Schema.ObjectId,
      ref: "School",
      validate: {
        //@TODO уточнить валидатор
        validator: function(array) {
          return array.length !== 0;
        }
      }
    }],
    teacher: {
      type: String,
      required: true,
      validate: {
        validator: function(name) {
          var regexp = /([а-яё]+)\s([а-яё]+)/i;
          return regexp.test(name);
        },
        message: "{VALUE} is ot valid name"
      }
    }
  }
);

module.exports = mongoose.model('Lecture', LectureSchema);
