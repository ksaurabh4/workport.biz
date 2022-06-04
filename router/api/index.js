

const router = require('express').Router();

router.use('/users', require('./usersRouter'));

router.use('/employees', require('./employeesRouter'));

router.use('/', require('./authRouter'));

module.exports = router;
