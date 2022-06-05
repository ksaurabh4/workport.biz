const bcrypt = require('bcryptjs');
const Joi = require('joi');
const expressAsyncHandler = require('express-async-handler');
const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');
const {
	returnPromise, updateQueryBuilder, addQueryBuilder, makeResponseData,
} = require('../utils/common');
const config = require('../config/appconfig');

const logger = new Logger();
const requestHandler = new RequestHandler(logger);

exports.createCompany = expressAsyncHandler(async (req, res) => {
	const {
		companyName,
		companyAddress,
		companyCity,
		companyState,
		companyCountry,
		companyZip,
		companyWebsite,
		companyPhone,
		companyEmail,
	} = req.body;
	try {
		const schema = Joi.object({
			companyName: Joi.string().required(),
			companyAddress: Joi.string(),
			companyCity: Joi.string(),
			companyCountry: Joi.string().required(),
			companyState: Joi.string(),
			companyZip: Joi.string(),
			companyWebsite: Joi.string(),
			companyPhone: Joi.number().required(),
			companyEmail: Joi.string().email().required(),
		});
		const { error } = schema.validate({
			companyName,
			companyAddress,
			companyCity,
			companyState,
			companyCountry,
			companyZip,
			companyWebsite,
			companyPhone,
			companyEmail,
		});

		if (error) {
			return requestHandler.validateJoi(error, 400, 'bad Request', error ? error.details[0].message : '');
		}
		const fetchCompanyByCompanyEmail = `SELECT * FROM companies where comp_email='${companyEmail}';`;
		const existingCompany = await returnPromise(fetchCompanyByCompanyEmail);
		if (existingCompany[0] && existingCompany[0].comp_id) {
			return requestHandler.throwError(400, 'bad request', 'Company with this email already existed')();
		}
		const { query, dataObj } = addQueryBuilder('companies', req.body);
		const company = await returnPromise(query, dataObj);
		const addUserQuery = `INSERT INTO users (user_email,user_pswd,user_comp_id,user_role,user_is_admin) 
      VALUES ('${companyEmail}','${bcrypt.hashSync(config.auth.user_default_password, config.auth.saltRounds)}',${company.insertId},'manager',${true});`;
		const user = await returnPromise(addUserQuery);
		const addEmployeeQuery = `INSERT INTO employees (emp_email,emp_comp_id,emp_is_manager,emp_user_id) 
		VALUE ('${companyEmail}',${company.insertId},${true},${user.insertId})`;
		await returnPromise(addEmployeeQuery);
		return res.send({ message: 'Company added successfully' });
	} catch (err) {
		return res.status(500).send({ message: err.message });
	}
});

exports.updateCompanyById = expressAsyncHandler(async (req, res) => {
	const companyId = req.params.id;
	const {
		companyName,
		companyAddress,
		companyCity,
		companyState,
		companyCountry,
		companyZip,
		companyWebsite,
		companyPhone,
		companyEmail,
	} = req.body;
	try {
		const schema = Joi.object({
			companyName: Joi.string(),
			companyAddress: Joi.string(),
			companyCity: Joi.string(),
			companyCountry: Joi.string(),
			companyState: Joi.string(),
			companyZip: Joi.string(),
			companyWebsite: Joi.string(),
			companyPhone: Joi.number(),
			companyEmail: Joi.string().email(),
			companyId: Joi.number().required(),
		});
		const { error } = schema.validate({
			companyName,
			companyAddress,
			companyCity,
			companyState,
			companyCountry,
			companyZip,
			companyWebsite,
			companyPhone,
			companyEmail,
			companyId,
		});
		if (error) {
			return requestHandler.validateJoi(error, 400, 'bad Request', error ? error.details[0].message : '');
		}
		const getcompanyBycompanyIdQuery = `SELECT * from companies WHERE comp_id=${companyId}`;
		const company = await returnPromise(getcompanyBycompanyIdQuery);
		if (!company[0]) {
			return requestHandler.validateJoi(error, 404, 'bad Request', 'No company found');
		}
		if (Object.keys(req.body).length > 0) {
			const { query, values } = updateQueryBuilder('companies', 'comp_id', companyId, req.body);
			await returnPromise(query, values);
		}
		return res.send({ message: 'Company data updated successfully' });
	} catch (err) {
		return res.status(500).send({ message: err.message });
	}
});

exports.getCompanyById = expressAsyncHandler(async (req, res) => {
	const companyId = req.params.id;
	try {
		const schema = Joi.object({
			companyId: Joi.number().min(1),
		});
		const { error } = schema.validate({
			companyId,
		});
		if (error) {
			return requestHandler.validateJoi(error, 400, 'bad Request', error ? error.details[0].message : '');
		}
		const getCompanyByCompanyIdQuery = `SELECT * from companies WHERE comp_id=${companyId}`;
		const company = await returnPromise(getCompanyByCompanyIdQuery);
		if (!company[0]) {
			return requestHandler.validateJoi(error, 404, 'bad Request', 'No company found');
		}
		const response = makeResponseData('companies', company[0]);
		return res.send(response);
	} catch (err) {
		return res.status(500).send({ message: err.message });
	}
});
