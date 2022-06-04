const Joi = require('joi');
const expressAsyncHandler = require('express-async-handler');
const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');
const { returnPromise, updateQueryBuilder, addQueryBuilder } = require('../utils/common');

const logger = new Logger();
const requestHandler = new RequestHandler(logger);

exports.createPlan = expressAsyncHandler(async (req, res) => {
	const {
		planName, planDuration, planDurationUnit, planPrice, planMaxEmployees,
	} = req.body;
	try {
		const schema = Joi.object({
			planName: Joi.string().required().min(5),
			planDuration: Joi.number(),
			planDurationUnit: Joi.string(),
			planPrice: Joi.number(),
			planMaxEmployees: Joi.number(),
		});
		const { error } = schema.validate({
			planName,
			planDuration,
			planDurationUnit,
			planPrice,
			planMaxEmployees,
		});

		if (error) {
			return requestHandler.validateJoi(error, 400, 'bad Request', error ? error.details[0].message : '');
		}
		const fetchPlanByName = `SELECT * FROM plans where plan_name='${planName}';`;
		const existingPlan = await returnPromise(fetchPlanByName);
		if (existingPlan[0] && existingPlan[0].plan_id) {
			return requestHandler.throwError(400, 'bad request', 'Plan with same anme already existed')();
		}
		const { query, dataObj } = addQueryBuilder('plans', req.body);
		await returnPromise(query, dataObj);
		return res.send({ message: 'Plan created successfully' });
	} catch (err) {
		return res.status(500).send({ message: err.message });
	}
});

exports.updatePlanById = expressAsyncHandler(async (req, res) => {
	const planId = req.params.id;
	const {
		planName, planDuration, planDurationUnit, planPrice, planMaxEmployees,
	} = req.body;
	try {
		const schema = Joi.object({
			planId: Joi.string().min(1),
			planName: Joi.string().min(5),
			planDuration: Joi.number(),
			planDurationUnit: Joi.string(),
			planPrice: Joi.number(),
			planMaxEmployees: Joi.number(),
		});
		const { error } = schema.validate({
			planId,
			planName,
			planDuration,
			planDurationUnit,
			planPrice,
			planMaxEmployees,
		});
		if (error) {
			return requestHandler.validateJoi(error, 400, 'bad Request', error ? error.details[0].message : '');
		}

		const getPlanByPlanIdQuery = `SELECT * from plans WHERE plan_id=${planId}`;
		const plan = await returnPromise(getPlanByPlanIdQuery);
		if (!plan[0]) {
			return requestHandler.validateJoi(error, 404, 'bad Request', 'No plan found with this id');
		}
		if (Object.keys(req.body).length > 0) {
			const { query, values } = updateQueryBuilder('plans', 'plan_id', planId, req.body);
			await returnPromise(query, values);
		}
		return res.send({ message: 'Plan data updated successfully' });
	} catch (err) {
		return res.send({ message: err.message });
	}
});
