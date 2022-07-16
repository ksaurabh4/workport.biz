const router = require('express').Router();
const GoalsController = require('../../controllers/goals.controller');
const auth = require('../../utils/auth');
/**
   * @swagger
   * definitions:
   *   goals:
   *     required:
   *       - id
   *       - email
   *     properties:
   *       id:
   *         type: integer
   *       email:
   *         type: string
   */

/**
 * @swagger
 * /goals/get:
 *   get:
 *     tags:
 *       - goals
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: return the user profile
 *         schema:
 *           $ref: '#/definitions/goals'
 */
router.get('/summary', auth.isAuthunticated, GoalsController.fetchGoalsSummary);

/**
 * @swagger
 * /goals/{GoalId}:
 *   get:
 *     tags:
 *       - goals
 *     description: Return a specific user
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     parameters:
 *      - name: GoalId
 *        description: numeric id of the user to get
 *        in: path
 *        required: true
 *        type: integer
 *        minimum: 1
 *     responses:
 *       200:
 *         description: a single user object
 *         schema:
 *           $ref: '#/definitions/goals'
 */
router.get('/:id', auth.isAuthunticated, GoalsController.getGoalById);

/**
 * @swagger
 * /goals/{goalId}:
 *   delete:
 *     tags:
 *       - goals
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     parameters:
 *      - name: GoalId
 *        description: numeric id of the user to get
 *        in: path
 *        required: true
 *        type: integer
 *        minimum: 1
 *     responses:
 *       200:
 *         description: delete user with id
 *         schema:
 *           $ref: '#/definitions/goals'
 */
// router.delete('/:id([0-9])', GoalsController.deleteById);

/**
 * @swagger
 * /goals/{goalId}:
 *   update:
 *     tags:
 *       - goals
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     parameters:
 *      - name: GoalId
 *        description: numeric id of the user to get
 *        in: path
 *        required: true
 *        type: integer
 *        minimum: 1
 *     responses:
 *       200:
 *         description: update user with id
 *         schema:
 *           $ref: '#/definitions/goals'
 */
router.put('/:id', auth.isAuthunticated, GoalsController.updateById);

/**
 * @swagger
 * /goals/profile:
 *   get:
 *     tags:
 *       - goals
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: return the user profile
 *         schema:
 *           $ref: '#/definitions/goals'
 */
// router.get('/profile', auth.isAuthunticated, GoalsController.getProfile);

/**
 * @swagger
 * /goals/create:
 *   post:
 *     tags:
 *       - goals
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: return the user profile
 *         schema:
 *           $ref: '#/definitions/goals'
 */
router.post('/create', auth.isAuthunticated, auth.isUserManagerOrHimself, GoalsController.createGoal);

/**
 * @swagger
 * /goals/create:
 *   get:
 *     tags:
 *       - goals
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: return the user profile
 *         schema:
 *           $ref: '#/definitions/goals'
 */
router.get('/', auth.isAuthunticated, GoalsController.fetchGoalsList);


module.exports = router;
