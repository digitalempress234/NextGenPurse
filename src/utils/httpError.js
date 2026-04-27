export const createHttpError = (message, statusCode = 500, extras = {}) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  Object.assign(err, extras);
  return err;
};

