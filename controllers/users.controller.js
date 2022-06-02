const bcrypt = require('bcryptjs');
const Joi = require('joi');
const expressAsyncHandler = require('express-async-handler');
const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');
const { returnPromise } = require('../utils/common');
const { generateToken } = require('../utils/auth');

const logger = new Logger();
const requestHandler = new RequestHandler(logger);

exports.createUser = expressAsyncHandler(async (req, res) => {
	const {
		companyId, userEmail, userPswd, userRole = 'user', isAdmin = true,
	} = req.body;
	try {
		const schema = Joi.object({
			companyId: Joi.number().required(),
			userEmail: Joi.string().email().required(),
			userPswd: Joi.string().min(6).required(),
		});
		const { error } = schema.validate({
			companyId,
			userEmail,
			userPswd,
		});

		if (error) {
			return requestHandler.validateJoi(error, 400, 'bad Request', error ? error.details[0].message : '');
		}
		const fetchUserByEmailQuery = `SELECT * FROM users where user_email='${userEmail}';`;
		const existingUser = await returnPromise(fetchUserByEmailQuery);
		if (existingUser[0] && existingUser[0].user_id) {
			return requestHandler.throwError(400, 'bad request', 'invalid email account,email already existed')();
		}
		const result = {
			userEmail, isAdmin, userRole, companyId,
		};
		const addUserQuery = `INSERT INTO users (user_email,user_pswd,user_comp_id,user_role,user_is_admin) 
      VALUES ('${userEmail}','${bcrypt.hashSync(userPswd, 8)}',${companyId},'${userRole}',${isAdmin});`;
		const user = await returnPromise(addUserQuery);
		result.userId = user.insertId;
		const token = generateToken(result);
		return res.send({ ...result, token });
	} catch (err) {
		return res.status(500).send({ message: err.message });
	}
});
