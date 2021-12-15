const express = require('express');
const router = express.Router();
const axios = require('axios');
const adminController = require('../controllers/adminController');
const searchController = require('../controllers/searchControllers');
const { catchErrors } = require('../handlers/errorHandlers');

router.get('/admin', (req, res) => {
    res.render('layout');
});
// provere za rute

router.get('/', (req, res) => {
    axios.get('http://127.0.0.1:8080/').then((response) => {
        res.redirect(response.config.url);
    });
});
router.get('/admin/getEmail', adminController.adminGetEmail);
router.get('/admin/dashboard/', adminController.adminDashboard);

router.get('/admin/add/airplane', adminController.addAirplaneForm);
router.post('/admin/add/airplane', catchErrors(adminController.addAirplane));

router.get('/admin/dashboard/flights', catchErrors(adminController.getFlights));

router.get('/admin/add/flight', catchErrors(adminController.addFlightForm));
router.post('/admin/add/flight', catchErrors(adminController.addFlight));

router.get('/admin/dashboard/airplanes', catchErrors(adminController.getAirplanes));

router.post('/admin/flight/:id/delete/', catchErrors(adminController.deleteFlight));

router.post('/admin/airplane/:id/delete/', catchErrors(adminController.deleteAirplane));

router.get('/search', catchErrors(searchController.searchDepartureFlight));
router.get('/getAllFlights', catchErrors(searchController.getAllFlights));

router.get('/getInfo', catchErrors(searchController.getInfo));
// router.get('/search/return', catchErrors(searchController.searchReturnFlight));

router.get('/search/return', catchErrors(searchController.searchReturnFlight));

router.get('/logout', adminController.logout);
router.get('/account', adminController.account);

router.get('/downgrade/passengers', searchController.updatePassengers);

router.get('/flightsInfo', adminController.flightsInfo);

// router.get('/cancel' , adminController.cancelFlight);

// router.post('/search', searchController.searchFlight);

module.exports = router;
