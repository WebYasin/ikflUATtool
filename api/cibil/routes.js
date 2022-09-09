'use strict';

const router                        = require('express').Router();
const { CibilController }           = require('@api/controller');
const Auth                          = require('@middleware/authorization');

router.post('/',                        Auth.isAuthenticated(),               CibilController.create);
router.get('/',                         Auth.isAuthenticated(),               CibilController.get);
router.put('/:id',                      Auth.isAuthenticated(),               CibilController.update);
router.delete('/:id',                   Auth.isAuthenticated(),               CibilController.remove);
router.post('/assetsCategory',          Auth.isAuthenticated(),               CibilController.assetsCategory);
router.get('/getAssetsCategory',        Auth.isAuthenticated(),               CibilController.getAssetsCategory);
router.put('/updateAssetsCategory/:id', Auth.isAuthenticated(),               CibilController.updateAssetsCategory);
router.post('/importAssestsCategory',   Auth.isAuthenticated(),               CibilController.importAssestsCategory);
router.delete('/removeAssestCategory/:id',  Auth.isAuthenticated(),               CibilController.removeAssestCategory);
router.get('/exportApplicationList',    Auth.isAuthenticated(),               CibilController.exportApplicationList);


module.exports = router;