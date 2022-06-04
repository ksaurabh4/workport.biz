const Joi = require('joi');
const expressAsyncHandler = require('express-async-handler');
const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');
const {
	returnPromise, updateQueryBuilder, addQueryBuilder, makeResponseData,
} = require('../utils/common');

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
		await returnPromise(query, dataObj);
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
