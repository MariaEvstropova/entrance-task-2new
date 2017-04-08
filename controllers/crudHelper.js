const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

module.exports.get_all_helper = function(model, req, res) {
  return model
              .find({}).exec()
              .then((data) => {
                res.json({
                  success: true,
                  data: data
                })
              }, (error) => {
                res.json({
                  success: false,
                  error: error
                });
              });
};

module.exports.get_item_byId = function(model, req, res) {
  let id = req.params.id;
  return model
              .findById(id).exec()
              .then((data) => {
                res.json({
                  success: true,
                  data: data
                })
              }, (error) => {
                res.json({
                  success: false,
                  error: error
                });
              });
};
