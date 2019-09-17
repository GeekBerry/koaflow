function flow(...functions) {
  return async (ctx, next) => {
    let arg = ctx;
    let ret = undefined;

    for (const func of functions) {
      ret = await func.call(ctx, arg, next);
      if (ret !== undefined) {
        arg = ret;
      }
    }

    return ret;
  };
}

module.exports = flow;
