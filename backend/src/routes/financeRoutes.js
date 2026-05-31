const express = require('express')
const router = express.Router()
const auth = require('../auth')
const financeController = require('../controllers/financeController')
const asyncWrapper = require('../utils/asyncWrapper')

router.get('/summary', auth.verifyToken, asyncWrapper.wrap(financeController.getSummary))
router.get('/transactions', auth.verifyToken, asyncWrapper.wrap(financeController.getTransactions))
router.get('/budgets', auth.verifyToken, asyncWrapper.wrap(financeController.getBudgets))
router.get('/accounts', auth.verifyToken, asyncWrapper.wrap(financeController.getAccounts))
router.post('/advice', asyncWrapper.wrap(financeController.getAiAdvice))

module.exports = router