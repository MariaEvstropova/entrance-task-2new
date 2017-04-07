var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.redirect('/v1');
});

module.exports = router;
