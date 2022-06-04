const bcrypt = require('bcryptjs');
const Joi = require('joi');
const expressAsyncHandler = require('express-async-handler');
const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');
const { returnPromise } = require('../utils/common');
const config = require('../config/appconfig');

const logger = new Logger();
const requestHandler = new RequestHandler(logger);

exports.createEmployee = expressAsyncHandler(async (req, res) => {
	const {
		companyId, empCode, empName, empPhoneNum, empEmail, empAddress, empCity, empState, empCountry, empZip, empManagerId, empRole = 'user', empDept, empSubDept, empDesignation, isAdmin = false,
	} = req.body;
	try {
		const schema = Joi.object({
			companyId: Joi.number().required(),
			empEmail: Joi.string().email().required(),
			empName: Joi.string().required(),
			empCity: Joi.string().required(),
			empState: Joi.string().required(),
			empCountry: Joi.string().required(),
			empManagerId: Joi.number().required(),
		});
		const { error } = schema.validate({
			companyId,
			empEmail,
			empName,
			empCity,
			empState,
			empCountry,
			empManagerId,
		});

		if (error) {
			return requestHandler.validateJoi(error, 400, 'bad Request', error ? error.details[0].message : '');
		}
		const fetchUserByEmailQuery = `SELECT * FROM users where user_email='${empEmail}';`;
		const existingUser = await returnPromise(fetchUserByEmailQuery);
		if (existingUser[0] && existingUser[0].user_id) {
			return requestHandler.throwError(400, 'bad request', 'employee with this email already existed')();
		}
		const addUserQuery = `INSERT INTO users (user_email,user_pswd,user_comp_id,user_role,user_is_admin) 
      VALUES ('${empEmail}','${bcrypt.hashSync(config.auth.user_default_password, config.auth.saltRounds)}',${companyId},'${empRole}',${isAdmin});`;
		const user = await returnPromise(addUserQuery);
		if (user.insertId) {
			const addEmployeeQuery = `INSERT INTO employees
	(emp_user_id, emp_email, emp_code, emp_name, emp_phone, emp_adress, emp_city, emp_state, emp_country, emp_zip, emp_dept, emp_sub_dept, emp_designation, emp_is_manager, emp_manager_id, emp_comp_id)
	VALUES(${user.insertId}, '${empEmail}','${empCode}' ,'${empName}','${empPhoneNum}', '${empAddress}', '${empCity}', '${empState}', '${empCountry}', '${empZip}', '${empDept}', '${empSubDept}', '${empDesignation}', ${empRole !== 'user'}, ${empManagerId}, ${companyId});`;
			await returnPromise(addEmployeeQuery);
		}
		return res.send({ message: 'Employee create successfully' });
	} catch (err) {
		return res.status(500).send({ message: err.message });
	}
});

exports.getEmployeeById = expressAsyncHandler(async (req, res) => {
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
			requestHandler.validateJoi(error, 400, 'bad Request', 'invalid Employee Id');
		}
		const getEmployeeByIdAndCompanyIdQuery = `SELECT * from employees WHERE emp_id=${empId} and emp_comp_id=${companyId};`;
		const employee = await returnPromise(getEmployeeByIdAndCompanyIdQuery);
		if (employee[0] && employee[0].emp_id) {
			return res.send({
				empCode: employee[0].emp_code,
				empName: employee[0].emp_name,
				empPhoneNum: employee[0].emp_phone,
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
