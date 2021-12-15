const mongoose = require('mongoose');
const User = mongoose.model('User');
const axios = require('axios');

exports.ticketsPage = async (req, res) => {
    const params = new URLSearchParams({
        userId: res.locals.user._id,
    });
    const url = 'http://127.0.0.1:8080/getTickets?' + params;
    const resp = await axios.get(url);

    flightIds = [];
    const tickets = resp.data;
    tickets.forEach((ticket) => {
        flightIds.push(ticket.flightId);
    });
    const params2 = new URLSearchParams({
        flightIds: flightIds,
    });
    const url2 = 'http://127.0.0.1:8080/flightsInfo?' + params2;
    const resp2 = await axios.get(url2);
    const flights = resp2.data;

    res.render('myTickets', { title: 'My Tickets', flights });
};

exports.buyTicket = async (req, res) => {
    const user = await User.findOne({ _id: res.locals.user.id });
    req.session.flightId = req.params.id;
    req.session.id = user.id;

    const params = new URLSearchParams({
        flightId: req.params.id,
        userId: user.id,
        passengers: req.session.passengers,
        email: res.locals.user.gravatar,
        rank: res.locals.user.rank,
    }).toString();
    const url = 'http://127.0.0.1:8080/tickets?' + params;
    axios
        .get(url)
        .then((response) => {
            res.redirect(response.config.url);
        })
        .catch((error) => {
            console.log(error);
        });
};
