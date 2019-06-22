const model = require('./model');

function create({ name, age }) {
  return model.create({ name, age });
}

function query(id) {
  return model.findById(id);
}

function list({ limit, offset }) {
  return model.find({ limit, offset });
}

module.exports = {
  create,
  query,
  list,
};
