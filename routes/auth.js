const express = require('express');
const passport = require('passport');
const router = express.Router();

// @desc  Authenticate using Google oauth
// @route GET /auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile'] }))


// @desc  Google auth callback
// @route GET /auth/google/callback
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
    res.redirect('/dashboard')
})

// @desc  Log user out
// @route GET /auth/logout
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
})

module.exports = router;