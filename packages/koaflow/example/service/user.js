class UserService {
  constructor(ctx) {
    this.config = ctx.app.config;
    this.service = ctx.service;
    this.logger = ctx.app.logger;
  }

  create(options) {
    const { logger } = this;
    logger.info({ service: 'user', func: 'create', options });
    return options;
  }

  query(options) {
    const { logger } = this;
    logger.info({ service: 'user', func: 'query', options });
    return { ...options, name: 'Tom', age: 18, password: 'psw' };
  }
}

module.exports = (...args) => new UserService(...args);
