const Joi = require('joi');
const expressAsyncHandler = require('express-async-handler');
const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');
const { returnPromise } = require('../utils/common');

const logger = new Logger();
const requestHandler = new RequestHandler(logger);


exports.fetchReport = expressAsyncHandler(async (req, res) => {
	// const { reportType } = req.query;
	try {
		// const schema = Joi.object({
		// 	reportType: Joi.string().min(1).required(),
		// });
		// const { error } = schema.validate({
		// 	reportType,
		// });
		// if (error) {
		// 	return requestHandler.validateJoi(error, 400, 'bad Request', error ? error.details[0].message : '');
		// }

		const fetchEmpQuery = `SELECT * FROM employees WHERE emp_id=${req.user.empId}`;
		const loggedEmp = await returnPromise(fetchEmpQuery);

		const totalEmpCountQuery = `SELECT COUNT(*) as empCount FROM employees WHERE emp_comp_id=${req.user.companyId}`;
		const empCount = await returnPromise(totalEmpCountQuery);
		const sameTeamEmpCountQuery = `SELECT COUNT(*) as sameTeamEmpCount FROM employees WHERE emp_manager_id=${loggedEmp[0].emp_manager_id}`;
		const sameTeamEmpCount = await returnPromise(sameTeamEmpCountQuery);
		const reporteeCountQuery = `SELECT COUNT(*) as reporteeCount FROM employees WHERE emp_manager_id=${req.user.empId}`;
		const reporteeCount = await returnPromise(reporteeCountQuery);
		const totalPendingTaskQuery = `SELECT COUNT(*) as pendingTaskCount FROM todos WHERE todo_user_id=${req.user.userId} AND todo_is_completed=0`;
		const pendingTaskCount = await returnPromise(totalPendingTaskQuery);

		const empWiseGoalsQuery = `SELECT employees.emp_name as empName, AVG(goal_score) as score FROM goals 
INNER JOIN employees ON goals.goal_emp_id=employees.emp_id
WHERE goals.goal_comp_id=${req.user.companyId} GROUP BY goals.goal_emp_id;`;
		const empWiseScore = await returnPromise(empWiseGoalsQuery);
		return res.send({
			empWiseScore,
			counter: {
				empCount: empCount[0].empCount,
				pendingTaskCount: pendingTaskCount[0].pendingTaskCount,
				sameTeamEmpCount: sameTeamEmpCount[0].sameTeamEmpCount,
				reporteeCount: reporteeCount[0].reporteeCount,
			},
		});
	} catch (err) {
		return res.send({ message: err.message });
	}
});
