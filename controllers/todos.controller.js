const Joi = require('joi');
const expressAsyncHandler = require('express-async-handler');
const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');
const {
	returnPromise, updateQueryBuilder, addQueryBuilder, makeResponseData,
} = require('../utils/common');

const logger = new Logger();
const requestHandler = new RequestHandler(logger);

exports.createTodo = expressAsyncHandler(async (req, res) => {
	const { userId } = req.user;
	const {
		todoContent,
		todoDueDateTime,
		todoStatus = 'pending',
	} = req.body;
	try {
		const schema = Joi.object({
			todoContent: Joi.string().required(),
			todoDueDateTime: Joi.date().iso().greater('now').required(),
			todoStatus: Joi.string().required().valid('pending', 'completed'),
		});
		const { error } = schema.validate({
			todoContent,
			todoDueDateTime,
			todoStatus,
		});

		if (error) {
			return requestHandler.validateJoi(error, 400, 'bad Request', error ? error.details[0].message : '');
		}
		const { query, dataObj } = addQueryBuilder('todos', { ...req.body, userId });
		await returnPromise(query, dataObj);
		return res.send({ message: 'Todo added successfully' });
	} catch (err) {
		return res.status(500).send({ message: err.message });
	}
});

exports.updateTodoById = expressAsyncHandler(async (req, res) => {
	const todoId = req.params.id;
	const { userId } = req.user;
	const {
		todoContent,
		todoDueDateTime,
		todoStatus,
	} = req.body;
	try {
		const schema = Joi.object({
			todoId: Joi.number().min(1).required(),
			todoContent: Joi.string(),
			todoDueDateTime: Joi.date().iso().greater('now'),
			todoStatus: Joi.string(),
		});
		const { error } = schema.validate({
			todoId,
			todoContent,
			todoDueDateTime,
			todoStatus,
		});
		if (error) {
			return requestHandler.validateJoi(error, 400, 'bad Request', error ? error.details[0].message : '');
		}
		const getTodoByTodoIdQuery = `SELECT * from todos WHERE todo_id=${todoId} and todo_user_id=${userId}`;
		const todo = await returnPromise(getTodoByTodoIdQuery);
		if (!todo[0]) {
			return requestHandler.validateJoi(error, 404, 'bad Request', 'No todo found');
		}
		if (Object.keys(req.body).length > 0) {
			const { query, values } = updateQueryBuilder('todos', 'todo_id', todoId, req.body);
			await returnPromise(query, values);
		}
		return res.send({ message: 'Todo data updated successfully' });
	} catch (err) {
		return res.status(500).send({ message: err.message });
	}
});

exports.getTodoById = expressAsyncHandler(async (req, res) => {
	const todoId = req.params.id;
	const { userId } = req.user;
	try {
		const schema = Joi.object({
			todoId: Joi.number().min(1).required(),
		});
		const { error } = schema.validate({
			todoId,
		});
		if (error) {
			return requestHandler.validateJoi(error, 400, 'bad Request', error ? error.details[0].message : '');
		}
		const getTodoByTodoIdQuery = `SELECT * from todos WHERE todo_id=${todoId} and todo_user_id=${userId}`;
		const todo = await returnPromise(getTodoByTodoIdQuery);
		if (!todo[0]) {
			return requestHandler.validateJoi(error, 404, 'bad Request', 'No todo found');
		}
		const response = makeResponseData('todos', todo[0]);
		return res.send(response);
	} catch (err) {
		return res.status(500).send({ message: err.message });
	}
});
