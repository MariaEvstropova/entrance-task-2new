const express = require('express');
const app = express();

const morgan = require('morgan');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');

const index = require('./routes/index');
const api = require('./routes/api');
const config = require('config');

const port = config.port || 9090;

//Cоздаем подключение к базе данных, указанной в файле конфигурации
mongoose.connect(config.DBHost);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

//Логируем запросы в командную строку (в стиле dev)
app.use(morgan('dev'));
//Парсим запросы в формате application/json и application/x-www-form-urlencoded
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', index);
app.use('/v1', api);

//Все запросы, которые не попали в index и api будем обрабатывать как ошибки 404
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    'success': false,
    'message': 'resource not found'
  });
});

app.listen(port);
console.log('Listening on port ' + port);

module.exports = app;
