const Joi = require('joi');
const expressAsyncHandler = require('express-async-handler');
const moment = require('moment');
const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');
const {
	returnPromise, updateQueryBuilder, addQueryBuilder, makeResponseData,
} = require('../utils/common');

const logger = new Logger();
const requestHandler = new RequestHandler(logger);

exports.createTodo = expressAsyncHandler(async (req, res) => {
	const { companyId, userId } = req.user;
	const {
		todoContent,
		todoDueDateTime,
		todoIsCompleted = false,
	} = req.body;
	try {
		const schema = Joi.object({
			todoContent: Joi.string().required(),
			todoDueDateTime: Joi.date().iso().greater('now').required(),
			todoIsCompleted: Joi.boolean().required(),
		});
		const { error } = schema.validate({
			todoContent,
			todoDueDateTime,
			todoIsCompleted,
		});

		if (error) {
			return requestHandler.validateJoi(error, 400, 'bad Request', error ? error.details[0].message : '');
		}
		const { query, dataObj } = addQueryBuilder('todos', {
			todoContent,
			todoDueDateTime: moment(todoDueDateTime).format('YYYY-MM-DD HH:mm:ss'),
			todoIsCompleted,
			userId,
			companyId,
		});
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

exports.deleteTodoById = expressAsyncHandler(async (req, res) => {
	const { id } = req.params;
	const { userId } = req.user;
	try {
		const schema = Joi.object({
			userId: Joi.number().required(),
			id: Joi.number().required(),
		});
		const { error } = schema.validate({
			userId,
			id,
		});

		if (error) {
			return requestHandler.validateJoi(error, 400, 'bad Request', error ? error.details[0].message : '');
		}
		const query = `DELETE FROM todos WHERE todo_user_id=${userId} AND todo_id=${id}`;
		const response = await returnPromise(query);
		if (response.affectedRows !== 1) {
			return res.status(404).send({ message: 'Either You not have access to remove this or no record found with given id' });
		}
		return res.send({ message: 'Todo deleted successfully' });
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

exports.fetchTodoList = expressAsyncHandler(async (req, res) => {
	const { companyId, userId } = req.user;
	try {
		const query = `SELECT todo_id AS todoId, todo_content as todoContent, todo_due_date_time as todoDueDateTime, todo_is_completed as todoIsCompleted, todo_user_id as userId, todo_comp_id as companyId FROM todos WHERE todo_comp_id=${companyId} AND todo_user_id=${userId} order by todo_due_date_time DESC;`;
		const response = await returnPromise(query);
		return res.send(response);
	} catch (err) {
		return res.status(500).send({ message: err.message });
	}
});
