function flow(...functions) {
  return async (ctx, next) => {
    let ret = undefined;

    let lastReturn = undefined;
    let nextParam = ctx;
    for (const func of functions) {
      lastReturn = await func.call(ctx, nextParam, next);
      if (lastReturn !== undefined) {
        nextParam = lastReturn;
        ret = lastReturn;
      }
    }

    return ret;
  };
}

module.exports = flow;
