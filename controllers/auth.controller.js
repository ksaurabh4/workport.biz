// const moment = require("moment");
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const expressAsyncHandler = require('express-async-handler');
const { generateToken } = require('../middlewares/authJwt');
const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');
const { returnPromise } = require('../utils/common');

const logger = new Logger();
const requestHandler = new RequestHandler(logger);

exports.signUp = expressAsyncHandler(async (req, res) => {
	const {
		companyName, userEmail, userPswd, userRole = 'user', isAdmin = true,
	} = req.body;
	try {
		const schema = Joi.object({
			companyName: Joi.string().required(),
			userEmail: Joi.string().email().required(),
			userPswd: Joi.string().min(6).required(),
		});
		const { error } = schema.validate({
			companyName,
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
		const result = { comp_name: companyName, user_email: userEmail, user_is_admin: isAdmin };
		const addCompanyQuery = `INSERT INTO companies(comp_name) VALUES('${companyName}');`;
		const company = await returnPromise(addCompanyQuery);
		result.comp_id = company.insertId;
		const addUserQuery = `INSERT INTO users (user_email,user_pswd,user_comp_id,user_role,user_is_admin) 
      VALUES ('${userEmail}','${bcrypt.hashSync(userPswd, 8)}',${company.insertId},'${userRole}',${isAdmin});`;
		const user = await returnPromise(addUserQuery);
		result.user_id = user.insertId;
		const token = generateToken(result);
		return res.send({ ...result, token });
	} catch (err) {
		return res.status(500).send({ message: err.message });
	}
});

exports.login = expressAsyncHandler(async (req, res) => {
	const { userEmail, userPswd } = req.body;
	try {
		const schema = Joi.object({
			userEmail: Joi.string().email().required(),
			userPswd: Joi.string().required(),
		});
		const { error } = schema.validate({
			userEmail,
			userPswd,
		});

		if (error) {
			return requestHandler.validateJoi(error, 400, 'bad Request', error ? error.details[0].message : '');
		}

		const fetchUserByEmailQuery = `SELECT * FROM users where user_email='${userEmail}';`;
		const user = await returnPromise(fetchUserByEmailQuery);
		if (!user[0]) {
			return requestHandler.throwError(400, 'bad request', 'your email is not registered with us')();
		}

		if (bcrypt.compareSync(userPswd, user[0].user_pswd)) {
			const {
				user_id, user_email, user_is_admin, user_role,
			} = user[0];
			return res.send({
				user_id,
				user_email,
				user_is_admin,
				user_role,
				token: generateToken(user[0]),
			});
		}
		return res.status(401).send({ message: 'Invalid Email or Password' });
	} catch (error) {
		return res.status(500).send({ message: error.message });
	}
});

exports.logOut = expressAsyncHandler((req, res) => res.send({ message: 'user logged out successfully' }));
