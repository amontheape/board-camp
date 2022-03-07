import Joi from 'joi';

const customersSchema = Joi.object({
  name: Joi.string().min(3).required(),
  phone: Joi.string().regex(/^[0-9]{11}$/).required(),
  cpf: Joi.string().regex(/^[0-9]{11}$/).required(),
  birthday: Joi.string().regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/).required()
});

export default customersSchema;