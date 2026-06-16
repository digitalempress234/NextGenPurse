export const createHttpError = (message, statusCode = 500, extras = {}) => {
  const err = new Error(message) as Error & { statusCode?: number };
  err.statusCode = statusCode;
  Object.assign(err, extras);
  return err;
};

