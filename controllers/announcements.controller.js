const Joi = require('joi');
const expressAsyncHandler = require('express-async-handler');
const moment = require('moment');
const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');
const {
	returnPromise, updateQueryBuilder, addQueryBuilder, makeResponseData, fetchWithMultipleParamsQueryBuilder,
} = require('../utils/common');

const logger = new Logger();
const requestHandler = new RequestHandler(logger);

exports.createAnnouncement = expressAsyncHandler(async (req, res) => {
	const {
		announcementTo,
		announcementSubject,
		companyId,
		announcementContent,
	} = req.body;
	try {
		const schema = Joi.object({
			announcementTo: Joi.string().required(),
			announcementSubject: Joi.string().required(),
			companyId: Joi.number().min(1).required(),
			announcementContent: Joi.string().required(),
		});
		const { error } = schema.validate({
			announcementTo,
			announcementSubject,
			announcementContent,
			companyId,
		});

		if (error) {
			return requestHandler.validateJoi(error, 400, 'bad Request', error ? error.details[0].message : '');
		}
		const { query, dataObj } = addQueryBuilder('announcements', { ...req.body, announcementCreateAt: moment().format('YYYY-MM-DD HH:mm:ss') });
		await returnPromise(query, dataObj);
		return res.send({ message: 'Announcement added successfully' });
	} catch (err) {
		return res.status(500).send({ message: err.message });
	}
});

exports.updateAnnouncementById = expressAsyncHandler(async (req, res) => {
	const announcementId = req.params.id;
	const {
		subsStartDate,
		subsEndDate,
		announcementIsActive,
		planId,
		companyId,
	} = req.body;
	try {
		const schema = Joi.object({
			subsStartDate: Joi.date().iso(),
			subsEndDate: Joi.date().iso(),
			announcementIsActive: Joi.boolean(),
			planId: Joi.number().min(1),
			announcementId: Joi.number().min(1),
			companyId: Joi.number().min(1).required(),
		});
		const { error } = schema.validate({
			subsStartDate,
			subsEndDate,
			announcementIsActive,
			planId,
			companyId,
			announcementId,
		});
		if (error) {
			return requestHandler.validateJoi(error, 400, 'bad Request', error ? error.details[0].message : '');
		}
		const getSubsBySubsIdQuery = `SELECT * from subscriptions WHERE subs_id=${announcementId} and subs_comp_id=${companyId}`;
		const subs = await returnPromise(getSubsBySubsIdQuery);
		if (!subs[0]) {
			return requestHandler.validateJoi(error, 404, 'bad Request', 'No announcementfound');
		}
		if (Object.keys(req.body).length > 0) {
			const { query, values } = updateQueryBuilder('subscriptions', 'subs_id', announcementId, { ...req.body, announcementCreateAt: Date.now() });
			await returnPromise(query, values);
		}
		return res.send({ message: 'Announcementdata updated successfully' });
	} catch (err) {
		return res.status(500).send({ message: err.message });
	}
});

exports.getAnnouncementById = expressAsyncHandler(async (req, res) => {
	const announcementId = req.params.id;
	const { companyId } = req.body;
	try {
		const schema = Joi.object({
			announcementId: Joi.number().min(1),
			companyId: Joi.number().min(1).required(),
		});
		const { error } = schema.validate({
			companyId,
			announcementId,
		});
		if (error) {
			return requestHandler.validateJoi(error, 400, 'bad Request', error ? error.details[0].message : '');
		}
		const getSubsBySubsIdQuery = `SELECT * from subscriptions WHERE subs_id=${announcementId} and subs_comp_id=${companyId}`;
		const subs = await returnPromise(getSubsBySubsIdQuery);
		if (!subs[0]) {
			return requestHandler.validateJoi(error, 404, 'bad Request', 'No announcementfound');
		}
		const response = makeResponseData('subscriptions', subs[0]);
		return res.send(response);
	} catch (err) {
		return res.status(500).send({ message: err.message });
	}
});

exports.fetchAnnouncementList = expressAsyncHandler(async (req, res) => {
	const { companyId } = req.query;
	const { userRole, isAdmin } = req.user;
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
		let query = '';
		if (userRole === 'superadmin') {
			query = 'SELECT * from announcements';
		} else if (isAdmin) {
			query = `SELECT announcement_id as announcementId, announcement_content as  announcementContent, announcement_subject as announcementSubject, announcement_is_active as announcementIsActive, announcement_to as announcementTo, announcement_comp_id as announcementCompId, announcement_created_at as announcementCreatedAt from announcements WHERE announcement_comp_id=${companyId} OR announcement_to='admins' Order By announcement_created_at Desc`;
		} else if (userRole === 'manager') {
			query = `SELECT announcement_id as announcementId, announcement_content as  announcementContent, announcement_subject as announcementSubject, announcement_is_active as announcementIsActive, announcement_to as announcementTo, announcement_comp_id as announcementCompId, announcement_created_at as announcementCreatedAt from announcements WHERE announcement_comp_id=${companyId} AND announcement_to='managers' Order By announcement_created_at Desc`;
		} else {
			query = `SELECT announcement_id as announcementId, announcement_content as  announcementContent, announcement_subject as announcementSubject, announcement_is_active as announcementIsActive, announcement_to as announcementTo, announcement_comp_id as announcementCompId, announcement_created_at as announcementCreatedAt from announcements WHERE announcement_comp_id=${companyId} AND announcement_to='all' Order By announcement_created_at Desc`;
		}

		const response = await returnPromise(query);
		return res.send(response);
	} catch (err) {
		return res.status(500).send({ message: err.message });
	}
});

exports.deleteAnnouncementById = expressAsyncHandler(async (req, res) => {
	const { companyId } = req.user;
	const { id } = req.params;
	try {
		const schema = Joi.object({
			companyId: Joi.number().required(),
			id: Joi.number().required(),
		});
		const { error } = schema.validate({
			companyId,
			id,
		});

		if (error) {
			return requestHandler.validateJoi(error, 400, 'bad Request', error ? error.details[0].message : '');
		}
		const query = `DELETE FROM announcements WHERE announcement_comp_id=${companyId} AND announcement_id=${id}`;
		const response = await returnPromise(query);
		if (response.affectedRows !== 1) {
			return res.status(404).send({ message: 'No record found with given id' });
		}
		return res.send({ message: 'Announcement deleted successfully' });
	} catch (err) {
		return res.status(500).send({ message: err.message });
	}
});
