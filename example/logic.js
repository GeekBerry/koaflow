class Logic {
  constructor(app) {
    this.app = app;
  }

  create({ name, age }) {
    const {
      app: { model },
    } = this;

    return model.create({ name, age });
  }

  query(id) {
    const {
      app: { model },
    } = this;

    return model.findById(id);
  }

  list({ limit, offset }) {
    const {
      app: { model },
    } = this;

    return model.find({ limit, offset });
  }
}

module.exports = app => new Logic(app);
