"use strict";

const router = require("express").Router();

/**
 * Import All Express Router Here
 */

router.use('/file',                     require("./file/routes"));
router.use('/logs',                     require("./logs/routes"));
router.use('/role',                     require("./role/routes"));
router.use('/session',                  require("./session/routes"));
router.use('/user',                     require("./user/routes"));
router.use('/cibil',                    require("./cibil/routes"));
router.use('/oracle',                   require("./oracle/routes"));
router.use('/history',                   require("./history/routes"));

module.exports = router;