var express = require('express');
const router = express.Router();
// var adminService = require('../AdminService/routes/index');
var userService = require('../UserService/routes/index');
// var userServiceAdmin = require('../UserService/routes/admin.router');
// var ticketService = require('../TicketService/routes/index');

router.use((req, res, next) => {
    console.log('Called: ', req.path);
    next();
});

router.use(userService);
// router.use(userServiceAdmin);
// router.use(adminService);
// router.use(ticketService);

module.exports = router;
