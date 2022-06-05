const router = require('express').Router();
const TodosController = require('../../controllers/todos.controller');
const { isUserHimself } = require('../../utils/auth');
const auth = require('../../utils/auth');
/**
   * @swagger
   * definitions:
   *   todos:
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
 * /todos/{todoId}:
 *   get:
 *     tags:
 *       - todos
 *     description: Return a specific user
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     parameters:
 *      - name: SubsId
 *        description: numeric id of the user to get
 *        in: path
 *        required: true
 *        type: integer
 *        minimum: 1
 *     responses:
 *       200:
 *         description: a single user object
 *         schema:
 *           $ref: '#/definitions/todos'
 */
router.get('/:id', auth.isAuthunticated, TodosController.getTodoById);

/**
 * @swagger
 * /todos/{todoId}:
 *   delete:
 *     tags:
 *       - todos
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     parameters:
 *      - name: SubsId
 *        description: numeric id of the user to get
 *        in: path
 *        required: true
 *        type: integer
 *        minimum: 1
 *     responses:
 *       200:
 *         description: delete user with id
 *         schema:
 *           $ref: '#/definitions/todos'
 */
// router.delete('/:id([0-9])', TodosController.deleteById);

/**
 * @swagger
 * /todos/{todoId}:
 *   update:
 *     tags:
 *       - todos
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     parameters:
 *      - name: SubsId
 *        description: numeric id of the user to get
 *        in: path
 *        required: true
 *        type: integer
 *        minimum: 1
 *     responses:
 *       200:
 *         description: update user with id
 *         schema:
 *           $ref: '#/definitions/todos'
 */
router.put('/:id', auth.isAuthunticated, TodosController.updateTodoById);

/**
 * @swagger
 * /todos/profile:
 *   get:
 *     tags:
 *       - todos
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: return the user profile
 *         schema:
 *           $ref: '#/definitions/todos'
 */
// router.get('/profile', auth.isAuthunticated, TodosController.getProfile);

/**
 * @swagger
 * /todos/create:
 *   get:
 *     tags:
 *       - todos
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: return the user profile
 *         schema:
 *           $ref: '#/definitions/todos'
 */
router.post('/create', auth.isAuthunticated, TodosController.createTodo);


module.exports = router;
