const express = require('express');
const router = express.Router();
const auth = require('../auth');

	const asyncWrapper = require('../utils/asyncWrapper');
	router.post('/register', asyncWrapper.wrap(auth.register));

	router.post('/login', asyncWrapper.wrap(auth.login));

	router.post('/verify', asyncWrapper.wrap(auth.verifyEmail));
	router.post('/resend', asyncWrapper.wrap(auth.resendVerification));

	router.get('/profile', auth.verifyToken, asyncWrapper.wrap(auth.getProfile));

	router.post('/logout', asyncWrapper.wrap(auth.logout));

module.exports = router;
