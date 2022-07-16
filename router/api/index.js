

const router = require('express').Router();

router.use('/users', require('./usersRouter'));

router.use('/companies', require('./companiesRouter'));

router.use('/plans', require('./plansRouter'));

router.use('/reports', require('./reportsRouter'));

router.use('/subscriptions', require('./subscriptionsRouter'));

router.use('/announcements', require('./announcementsRouter'));

router.use('/todos', require('./todosRouter'));

router.use('/employees', require('./employeesRouter'));

router.use('/goals', require('./goalsRouter'));

router.use('/', require('./authRouter'));

module.exports = router;
