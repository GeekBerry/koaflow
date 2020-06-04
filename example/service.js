class Service {
  constructor(app) {
    this.app = app;
  }

  create(user) {
    const {
      app: { logger },
    } = this;

    logger.info({ func: 'create', user });
    return user;
  }

  query(id) {
    const {
      app: { logger },
    } = this;

    logger.info({ func: 'query', id });
    return { id, name: 'Tom', age: 18 };
  }
}

module.exports = Service;
