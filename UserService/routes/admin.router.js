const express = require('express');
const router = express.Router();
const User = require('../models/User');
const mongoose = require('mongoose');
const axios = require('axios');

router.get('/', (req, res) => {
    const params = new URLSearchParams({
        email: res.locals.user.gravatar,
        jwt: res.locals.jwt,
        rank: res.locals.user.rank,
    });
    const url = 'http://127.0.0.1:8080/admin/getEmail' + '?' + params; // /admin/getEmail
    axios
        .get(url)
        .then((response) => {
            res.redirect(response.config.url);
        })
        .catch((error) => {
            console.log(error);
        });
});

module.exports = router;
