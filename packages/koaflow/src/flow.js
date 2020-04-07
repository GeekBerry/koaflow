function flow(...functions) {
  return async (ctx, next) => {
    let arg = ctx;
    let ret = undefined;

    for (const func of functions) {
      const result = await func.call(ctx, arg, next);
      if (result !== undefined) {
        arg = result;
        ret = result;
      }
    }

    return ret;
  };
}

module.exports = flow;
