const bcrypt = require('bcryptjs');
const Joi = require('joi');
const expressAsyncHandler = require('express-async-handler');
const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');
const {
	returnPromise, updateQueryBuilder, fetchWithMultipleParamsQueryBuilder, addQueryBuilder,
} = require('../utils/common');
const config = require('../config/appconfig');

const logger = new Logger();
const requestHandler = new RequestHandler(logger);

exports.createGoal = expressAsyncHandler(async (req, res) => {
	const {
		companyId, employeeId, goalsType, goalsParameter, goalsAchieved, goalsScore, goalsWeekNum,
		goalsReviewStartDate, goalsReviewEndDate,
	} = req.body;
	try {
		const schema = Joi.object({
			companyId: Joi.number().required(),
			employeeId: Joi.number().required(),
			goalsType: Joi.string().required(),
			goalsParameter: Joi.string().required(),
			goalsAchieved: Joi.string().required(),
			goalsScore: Joi.number().required(),
			goalsWeekNum: Joi.number().required(),
			goalsReviewStartDate: Joi.date().required(),
			goalsReviewEndDate: Joi.date().required(),
		});
		const { error } = schema.validate({
			companyId,
			employeeId,
			goalsType,
			goalsParameter,
			goalsAchieved,
			goalsScore,
			goalsWeekNum,
			goalsReviewStartDate,
			goalsReviewEndDate,
		});

		if (error) {
			return requestHandler.validateJoi(error, 400, 'bad Request', error ? error.details[0].message : '');
		}
		const { query, dataObj } = addQueryBuilder('goals', req.body);
		await returnPromise(query, dataObj);
		return res.send({ message: 'Goal Added successfully' });
	} catch (err) {
		return res.status(500).send({ message: err.message });
	}
});

exports.getGoalById = expressAsyncHandler(async (req, res) => {
	const empId = req.params.id;
	const { companyId } = req.user;
	try {
		const schema = Joi.object({
			empId: Joi.number().min(1),
		});
		const { error } = schema.validate({
			empId,
		});
		if (error) {
			requestHandler.validateJoi(error, 400, 'bad Request', 'invalid Goal Id');
		}
		const getGoalByIdAndCompanyIdQuery = `SELECT * from employees WHERE emp_id=${empId} and emp_comp_id=${companyId};`;
		const employee = await returnPromise(getGoalByIdAndCompanyIdQuery);
		if (employee[0] && employee[0].emp_id) {
			return res.send({
				empCode: employee[0].emp_code,
				empName: employee[0].emp_name,
				empPhone: employee[0].emp_phone,
				empEmail: employee[0].emp_email,
				empAddress: employee[0].emp_address,
				empCity: employee[0].emp_city,
				empState: employee[0].emp_state,
				empCountry: employee[0].emp_country,
				empZip: employee[0].emp_zip,
				empManagerId: employee[0].emp_manager_id,
				empDept: employee[0].emp_email,
				empSubDept: employee[0].emp_email,
				empDesignation: employee[0].emp_email,
				isManager: employee[0].emp_is_manager === 1,
				empId: employee[0].emp_id,
				companyId: employee[0].emp_comp_id,
			});
		}
		return res.status(404).send({ message: 'no employee found with provided Id' });
	} catch (err) {
		return res.status(500).send({ message: err.message });
	}
});

exports.updateById = expressAsyncHandler(async (req, res) => {
	const empId = req.params.id;
	const { companyId } = req.user;
	try {
		const schema = Joi.object({
			empId: Joi.number().min(1),
		});
		const { error } = schema.validate({
			empId,
		});
		if (error) {
			return requestHandler.validateJoi(error, 400, 'bad Request', 'invalid Goal Id');
		}

		const getGoalByIdAndCompanyIdQuery = `SELECT * from employees WHERE emp_id=${empId} and emp_comp_id=${companyId};`;
		const employee = await returnPromise(getGoalByIdAndCompanyIdQuery);
		if (!employee[0]) {
			return requestHandler.validateJoi(error, 404, 'bad Request', 'No employee found with this id');
		}
		if ('isAdmin' in req.body || 'isManager' in req.body) {
			const formatIsManager = () => {
				if (req.body.isManager === undefined) {
					return null;
				} if (req.body.isManager === true) {
					return 'manager';
				}
				return 'user';
			};
			const { query, values } = updateQueryBuilder('users', 'user_email', employee[0].emp_email,
				{ isAdmin: req.body.isAdmin, userRole: formatIsManager() });
			await returnPromise(query, values);
			delete req.body.isAdmin;
		}
		if (Object.keys(req.body).length > 0) {
			const { query, values } = updateQueryBuilder('employees', 'emp_id', empId, req.body);
			await returnPromise(query, values);
		}
		return res.send({ message: 'Goal data updated successfully' });
	} catch (err) {
		return res.send({ message: err.message });
	}
});

exports.fetchGoalsList = expressAsyncHandler(async (req, res) => {
	const { companyId } = req.query;
	try {
		const schema = Joi.object({
			companyId: Joi.number().required(),
		});
		const { error } = schema.validate({
			companyId,
		});

		if (error) {
			return requestHandler.validateJoi(error, 400, 'bad Request', error ? error.details[0].message : '');
		}
		const query = fetchWithMultipleParamsQueryBuilder('employees', req.query);
		const response = await returnPromise(query);
		return res.send(response);
	} catch (err) {
		return res.status(500).send({ message: err.message });
	}
});
