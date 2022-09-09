'use strict';

const router                        = require('express').Router();
const { LogsController }            = require('@api/controller');
const Auth                          = require('@middleware/authorization');

router.post('/',           Auth.isAuthenticated(),       LogsController.create);
router.get('/',            Auth.isAuthenticated(),       LogsController.get);
router.put('/:id',         Auth.isAuthenticated(),       LogsController.update);
router.delete('/:id',      Auth.isAuthenticated(),       LogsController.remove);

module.exports = router;