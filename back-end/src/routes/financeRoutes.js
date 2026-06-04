const express = require('express')
const router = express.Router()
const auth = require('../auth')
const financeController = require('../controllers/financeController')
const asyncWrapper = require('../utils/asyncWrapper')

// Summary
router.get('/summary', auth.verifyToken, asyncWrapper.wrap(financeController.getSummary))

// Transactions
router.get('/transactions', auth.verifyToken, asyncWrapper.wrap(financeController.getTransactions))
router.post('/transactions', auth.verifyToken, asyncWrapper.wrap(financeController.addTransaction))
router.put('/transactions/:id', auth.verifyToken, asyncWrapper.wrap(financeController.updateTransaction))
router.delete('/transactions/:id', auth.verifyToken, asyncWrapper.wrap(financeController.deleteTransaction))

// Budgets
router.get('/budgets', auth.verifyToken, asyncWrapper.wrap(financeController.getBudgets))
router.post('/budgets', auth.verifyToken, asyncWrapper.wrap(financeController.addBudget))
router.put('/budgets/:id', auth.verifyToken, asyncWrapper.wrap(financeController.updateBudget))
router.delete('/budgets/:id', auth.verifyToken, asyncWrapper.wrap(financeController.deleteBudget))

// Accounts
router.get('/accounts', auth.verifyToken, asyncWrapper.wrap(financeController.getAccounts))
router.post('/accounts', auth.verifyToken, asyncWrapper.wrap(financeController.addAccount))
router.delete('/accounts/:id', auth.verifyToken, asyncWrapper.wrap(financeController.deleteAccount))

// AI
router.post('/advice', asyncWrapper.wrap(financeController.getAiAdvice))
router.get('/ai/status', asyncWrapper.wrap(financeController.getAiModelStatus))
router.post('/ai/predict', asyncWrapper.wrap(financeController.getAiModelPrediction))
router.post('/ai/recommend', asyncWrapper.wrap(financeController.getAiModelRecommendation))

module.exports = router