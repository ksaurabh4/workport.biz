const Joi = require('joi');
const expressAsyncHandler = require('express-async-handler');
const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');
const { returnPromise } = require('../utils/common');

const logger = new Logger();
const requestHandler = new RequestHandler(logger);


exports.fetchReport = expressAsyncHandler(async (req, res) => {
	const { reportType } = req.query;
	try {
		const schema = Joi.object({
			reportType: Joi.string().min(1).required(),
		});
		const { error } = schema.validate({
			reportType,
		});
		if (error) {
			return requestHandler.validateJoi(error, 400, 'bad Request', error ? error.details[0].message : '');
		}

		if (reportType === 'superadmin_dashboard') {
			const totalCompaniesCountQuery = 'SELECT COUNT(*) as compCount FROM companies';
			const compCount = await returnPromise(totalCompaniesCountQuery);
			const totalActiveCompQuery = 'SELECT COUNT(*) as activeCompCount FROM subscriptions WHERE subs_is_active = 1';
			const activeCompCount = await returnPromise(totalActiveCompQuery);
			const totalPaidCompaniesQuery = 'SELECT COUNT(*) as paidCompCount FROM subscriptions WHERE subs_plan_id != 1';
			const paidCompCount = await returnPromise(totalPaidCompaniesQuery);
			const totalUsersCountQuery = 'SELECT COUNT(*) as userCount FROM users';
			const userCount = await returnPromise(totalUsersCountQuery);
			const companyUserCountDetailQuery = `SELECT comp.comp_id as compId, comp.comp_name as compName, count(user.user_id) as userCount
			FROM companies comp
			JOIN users user
			ON (comp.comp_id=user.user_comp_id) 
			GROUP BY user.user_comp_id;`;
			const compUserCountdata = await returnPromise(companyUserCountDetailQuery);
			const companyWiseDetailQuery = `SELECT comp.comp_added_at as compAddedDate, subs.subs_is_active as subsIsActive, plan.plan_name as compPlanName
			FROM companies comp
			          LEFT JOIN subscriptions subs
			          ON (comp.comp_id=subs.subs_comp_id)
			          LEFT JOIN plans plan
			          ON (subs.subs_plan_id=plan.plan_id);`;
			const compWisedata = await returnPromise(companyWiseDetailQuery);
			const compDashboardData = compWisedata.map((comp, i) => ({ ...compUserCountdata[i], ...comp }));
			return res.send({
				compDashboardData,
				counter: {
					compCount: compCount[0].compCount,
					activeCompCount: activeCompCount[0].activeCompCount,
					paidCompCount: paidCompCount[0].paidCompCount,
					userCount: userCount[0].userCount,
				},
			});
		}
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
WHERE goals.goal_comp_id=${req.user.companyId} AND goal_review_start_date >= '${req.query.startDate}' AND goal_review_start_date <='${req.query.endDate}'
GROUP BY goals.goal_emp_id;`;
		const empWiseScore = await returnPromise(empWiseGoalsQuery);
		return res.send({
			empWiseScore,
			counter: {
				empCount: empCount[0].empCount,
				sameTeamEmpCount: sameTeamEmpCount[0].sameTeamEmpCount,
				reporteeCount: reporteeCount[0].reporteeCount,
				pendingTaskCount: pendingTaskCount[0].pendingTaskCount,
			},
		});
	} catch (err) {
		return res.send({ message: err.message });
	}
});
