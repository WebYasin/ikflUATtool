'use strict';

const router                        = require('express').Router();
const { RoleController }            = require('@api/controller');
const Auth                          = require('@middleware/authorization');

router.post('/',           Auth.isAuthenticated(),       RoleController.create);
router.get('/',            Auth.isAuthenticated(),       RoleController.get);
router.put('/:id',         Auth.isAuthenticated(),       RoleController.update);
router.delete('/:id',      Auth.isAuthenticated(),       RoleController.remove);

module.exports = router;