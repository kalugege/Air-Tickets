const express = require('express');
const router = express.Router();
const axios = require('axios');
const ticketController = require('../controllers/ticketController');
const { catchErrors } = require('../handlers/errorHandlers');

router.get('/', (req, res) => {
    axios.get('http://127.0.0.1:8080/').then((response) => {
        res.redirect(response.config.url);
    });
});

router.get('/tickets', ticketController.storeQuery);

router.get(
    '/tickets/buy',
    catchErrors(ticketController.infoTicket),
    catchErrors(ticketController.scheduleTrigger),
    ticketController.buyForm
);
router.post('/tickets/buy', catchErrors(ticketController.buyTicket));

router.get('/user/:id/addcard', ticketController.addCard);

router.get('/redirect/home', catchErrors(ticketController.homeRedirect));

router.get('/logout', ticketController.logout);

router.get('/getTicketInfo', catchErrors(ticketController.getTicketInfo));

router.get('/cancelTicket', catchErrors(ticketController.cancelTicket));




router.get('/getTickets', catchErrors(ticketController.getTickets));


module.exports = router;
