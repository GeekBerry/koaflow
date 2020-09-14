async function jsonRPCErrorFlow(arg, next) {
  const { result, error = {}, ...rest } = await next(arg);
  return {
    ...rest,
    result: {
      code: error.code || 0,
      message: error.message || '',
      result,
    },
  };
}

module.exports = jsonRPCErrorFlow;
