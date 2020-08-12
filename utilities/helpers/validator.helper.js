import Joi from 'joi';
import AppError from 'conduit-app-error';

function validate(req, res, body, schemas, next, options = undefined) {
  const extra = options || { abortEarly: false, stripUnknown: true };
  const { error } = Joi.validate(body, schemas, extra);
  const valid = error == null;
  // console.log(error)
  if (valid) {
    next();
  } else {
    const { details } = error;

    const message = details.map(err => {
      err.path.push(err.type.split('.').pop());
      let type = err.path.join('_').toUpperCase();
      return new AppError(type, err.message.replace(/['"]/g, ''));
    });
    throw message;
  }
}

const ValidatorHelper = {
  params: schemas => (req, res, next) =>
    validate(req, res, req.params, schemas, next),
  headers: schemas => (req, res, next) =>
    validate(req, res, req.headers, schemas, next),
  body: schemas => (req, res, next) =>
    validate(req, res, req.body, schemas, next),
  query: schemas => (req, res, next) =>
    validate(req, res, req.query, schemas, next),
  validate: schemas => (req, res, next) =>
    validate(req, res, {...req.body, ...req.params}, schemas, next)
};
export default ValidatorHelper;
