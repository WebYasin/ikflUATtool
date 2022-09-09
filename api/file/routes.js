'use strict';

const router                        = require('express').Router();
const { FileController }            = require('@api/controller');
const Auth                          = require('@middleware/authorization');

// router.post('/',           Auth.isAuthenticated(),       FileController.create);
router.get('/',            Auth.isAuthenticated(),       FileController.get);
// router.put('/:id',         Auth.isAuthenticated(),       FileController.update);
router.delete('/:id',      Auth.isAuthenticated(),       FileController.remove);

module.exports = router;