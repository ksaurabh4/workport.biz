

const router = require('express').Router();

router.use('/users', require('./usersRouter'));

router.use('/plans', require('./plansRouter'));

router.use('/subscriptions', require('./subscriptionsRouter'));

router.use('/employees', require('./employeesRouter'));

router.use('/', require('./authRouter'));

module.exports = router;
