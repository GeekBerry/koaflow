function flow(...functions) {
  return async (ctx, next) => {
    let arg = ctx;
    let ret = undefined;

    for (const func of functions) {
      ret = await func.call(ctx, arg);
      if (ret !== undefined) {
        arg = ret;
      }
    }

    await next();
    return ret;
  };
}

module.exports = flow;
