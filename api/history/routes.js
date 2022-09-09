'use strict';

const router                        = require('express').Router();
const { HistoryController }           = require('@api/controller');
const Auth                          = require('@middleware/authorization');

router.post('/',                  Auth.isAuthenticated(),               HistoryController.create);
router.get('/',                   Auth.isAuthenticated(),               HistoryController.get);



module.exports = router;