const Joi = require('joi');
const expressAsyncHandler = require('express-async-handler');
const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');
const {
	returnPromise, updateQueryBuilder, fetchWithMultipleParamsQueryBuilder,
	addQueryBuilder, makeResponseData,
} = require('../utils/common');

const logger = new Logger();
const requestHandler = new RequestHandler(logger);

exports.createGoal = expressAsyncHandler(async (req, res) => {
	const {
		companyId, empId, goalType, goalTerm, goalParameter, goalAchieved, goalScore, goalWeekNum,
		goalReviewStartDate, goalReviewEndDate,
	} = req.body;
	try {
		const schema = Joi.object({
			companyId: Joi.number().required(),
			empId: Joi.number().required(),
			goalType: Joi.string().required(),
			goalTerm: Joi.string().required(),
			goalParameter: Joi.string().required(),
			goalAchieved: Joi.number().required(),
			goalScore: Joi.number().required(),
			goalWeekNum: Joi.number().required(),
			goalReviewStartDate: Joi.date().required(),
			goalReviewEndDate: Joi.date().required(),
		});
		const { error } = schema.validate({
			companyId,
			empId,
			goalType,
			goalTerm,
			goalParameter,
			goalAchieved,
			goalScore,
			goalWeekNum,
			goalReviewStartDate,
			goalReviewEndDate,
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
	const goalId = req.params.id;
	const { companyId } = req.user;
	try {
		const schema = Joi.object({
			goalId: Joi.number().min(1),
		});
		const { error } = schema.validate({
			goalId,
		});
		if (error) {
			requestHandler.validateJoi(error, 400, 'bad Request', 'invalid Goal Id');
		}
		const getGoalByIdAndEmpIdQuery = `SELECT * from goals WHERE goals_id=${goalId} and goals_comp_id=${companyId};`;
		const goal = await returnPromise(getGoalByIdAndEmpIdQuery);
		if (!goal[0]) {
			return requestHandler.validateJoi(error, 404, 'bad Request', 'No goal found');
		}
		const response = makeResponseData('goals', goal[0]);
		return res.send(response);
	} catch (err) {
		return res.status(500).send({ message: err.message });
	}
});

exports.updateById = expressAsyncHandler(async (req, res) => {
	const goalId = req.params.id;
	const { companyId } = req.user;
	try {
		const schema = Joi.object({
			goalId: Joi.number().min(1),
		});
		const { error } = schema.validate({
			goalId,
		});
		if (error) {
			return requestHandler.validateJoi(error, 400, 'bad Request', 'invalid goal Id');
		}

		const getGoalByIdAndEmpIdQuery = `SELECT * from goals WHERE goals_id=${goalId} and goals_comp_id=${companyId};`;
		const goal = await returnPromise(getGoalByIdAndEmpIdQuery);
		if (!goal[0]) {
			return requestHandler.validateJoi(error, 404, 'bad Request', 'No goal found with this id');
		}
		if (Object.keys(req.body).length > 0) {
			const { query, values } = updateQueryBuilder('goals', 'goals_id', goalId, req.body);
			await returnPromise(query, values);
		}
		return res.send({ message: 'Goal data updated successfully' });
	} catch (err) {
		return res.send({ message: err.message });
	}
});

exports.fetchGoalsList = expressAsyncHandler(async (req, res) => {
	const { companyId, empId } = req.query;
	try {
		const schema = Joi.object({
			companyId: Joi.number().required(),
			empId: Joi.number().required(),
		});
		const { error } = schema.validate({
			companyId,
			empId,
		});

		if (error) {
			return requestHandler.validateJoi(error, 400, 'bad Request', error ? error.details[0].message : '');
		}
		const query = fetchWithMultipleParamsQueryBuilder('goals', req.query);
		const response = await returnPromise(query);
		return res.send(response);
	} catch (err) {
		return res.status(500).send({ message: err.message });
	}
});
