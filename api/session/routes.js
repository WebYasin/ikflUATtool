'use strict';

const router                        = require('express').Router();
const { SessionController }         = require('@api/controller');
const Auth                          = require('@middleware/authorization');

router.post('/',           Auth.isAuthenticated(),       SessionController.create);
router.get('/',            Auth.isAuthenticated(),       SessionController.get);
router.put('/:id',         Auth.isAuthenticated(),       SessionController.update);
router.delete('/:id',      Auth.isAuthenticated(),       SessionController.remove);

module.exports = router;