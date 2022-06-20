const router = require('express').Router();
const AnnouncementsController = require('../../controllers/announcements.controller');
const { isUserCompanyAdminOrSuperAdmin } = require('../../utils/auth');
const auth = require('../../utils/auth');
/**
   * @swagger
   * definitions:
   *   announcements:
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
 * /announcements/{announcementId}:
 *   get:
 *     tags:
 *       - announcements
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
 *           $ref: '#/definitions/announcements'
 */
router.get('/:id', auth.isAuthunticated, isUserCompanyAdminOrSuperAdmin, AnnouncementsController.getAnnouncementById);

/**
 * @swagger
 * /announcements/{announcementId}:
 *   delete:
 *     tags:
 *       - announcements
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
 *           $ref: '#/definitions/announcements'
 */
router.delete('/:id', auth.isAuthunticated, isUserCompanyAdminOrSuperAdmin, AnnouncementsController.deleteAnnouncementById);

/**
 * @swagger
 * /announcements/{announcementId}:
 *   update:
 *     tags:
 *       - announcements
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
 *           $ref: '#/definitions/announcements'
 */
router.put('/:id', auth.isAuthunticated, isUserCompanyAdminOrSuperAdmin, AnnouncementsController.updateAnnouncementById);

/**
 * @swagger
 * /announcements/profile:
 *   get:
 *     tags:
 *       - announcements
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: return the user profile
 *         schema:
 *           $ref: '#/definitions/announcements'
 */
// router.get('/profile', auth.isAuthunticated, AnnouncementsController.getProfile);

/**
 * @swagger
 * /announcements/create:
 *   get:
 *     tags:
 *       - announcements
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: return the user profile
 *         schema:
 *           $ref: '#/definitions/announcements'
 */
router.post('/create', auth.isAuthunticated, isUserCompanyAdminOrSuperAdmin, AnnouncementsController.createAnnouncement);

/**
 * @swagger
 * /announcements?companyId=:
 *   get:
 *     tags:
 *       - announcements
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: return the user profile
 *         schema:
 *           $ref: '#/definitions/announcements'
 */
router.get('/', auth.isAuthunticated, AnnouncementsController.fetchAnnouncementList);


module.exports = router;
