module.exports = {
  async create({ name, age }) {
    return { id: 1, name, age, _v: 1 };
  },

  async findById(userId) {
    if (userId === 1) {
      return { id: 1, name: 'Tom', age: 18, _v: 1 };
    } else {
      return null;
    }
  },

  async find({ limit, offset }) {
    // limit, offset ...
    return [
      { id: 1, name: 'Tom', age: 18, _v: 1 },
      { id: 2, name: 'Jerry', age: null, _v: 1 },
    ];
  },
};
