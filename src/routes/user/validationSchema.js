const Joi = require("joi");

const createUserSchema = (user) => {
  const schema = Joi.object().keys({
    username: Joi.string().min(8).required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),

  });

  return schema.validate(user);
};

module.exports = createUserSchema;
