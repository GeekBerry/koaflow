function flow(...functions) {
  return async (ctx) => {
    let arg = ctx;
    let ret = undefined;

    for (const func of functions) {
      ret = await func.call(ctx, arg);
      arg = ret;
    }

    return ret;
  };
}

module.exports = flow;
