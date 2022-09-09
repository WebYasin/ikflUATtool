'use strict';

const router                        = require('express').Router();
const { OracleController }          = require('@api/controller');
const Auth                          = require('@middleware/authorization');

router.get('/',                            Auth.isAuthenticated(),               OracleController.get);
router.get('/getStates',                   Auth.isAuthenticated(),               OracleController.getStates);
router.post('/createBranch',               Auth.isAuthenticated(),               OracleController.createBranch);
router.get('/getBranch',                   Auth.isAuthenticated(),               OracleController.getBranch);
router.put('/updateBranch/:id',            Auth.isAuthenticated(),               OracleController.updateBranch);
router.post('/importBranchList',           Auth.isAuthenticated(),               OracleController.importBranchList);
router.post('/createCropMaster',           Auth.isAuthenticated(),               OracleController.createCropMaster);
router.get('/getCropMaster',               Auth.isAuthenticated(),               OracleController.getCropMaster);
router.put('/updateCropMaster/:id',        Auth.isAuthenticated(),               OracleController.updateCropMaster);
router.post('/importCropMaster',           Auth.isAuthenticated(),               OracleController.importCropMaster);
router.post('/incomeMitigants',            Auth.isAuthenticated(),               OracleController.incomeMitigants);
router.get('/getIncomeMitigants',          Auth.isAuthenticated(),               OracleController.getIncomeMitigants);
router.put('/updateIncomeMitigants/:id',   Auth.isAuthenticated(),               OracleController.updateIncomeMitigants);
router.post('/importIncomeMitigants',      Auth.isAuthenticated(),               OracleController.importIncomeMitigants);


module.exports = router;