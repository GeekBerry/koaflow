function assignContext(options) {
  return async (ctx, next) => {
    for (const [key, value] of Object.entries(options)) {
      if (key in ctx) {
        throw new Error(`ctx already have key "${key}"`);
      }
      ctx[key] = value;
    }

    await next();
  };
}

module.exports = assignContext;
