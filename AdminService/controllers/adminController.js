const mongoose = require('mongoose');
const Airplane = mongoose.model('Airplane');
const Flight = mongoose.model('Flight');
const axios = require('axios');
const { response } = require('express');
const Queue = require('bee-queue');

const options = {
    removeOnsucces: true,
    redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
    },
};
const userRank = new Queue('user', options);
const cancelTicket = new Queue('ticket', options);
const sendEmail = new Queue('email', options);

exports.addAirplane = async (req, res, next) => {
    const airplane = new Airplane({
        name: req.body.name,
        capacity: req.body.capacity,
    });
    await airplane.save();
    res.redirect('back');
};

exports.addFlight = async (req, res, next) => {
    const airplane = await Airplane.findOne({ _id: req.body.airplane });

    await airplane.update({ $set: { active: req.body.arrival } });

    const flight = new Flight({
        from: req.body.from,
        to: req.body.to,
        departure: new Date(req.body.departure),
        arrival: new Date(req.body.arrival),
        price: req.body.price,

        airplane: airplane,
    });

    await flight.save();
    res.redirect('back');
    // next();
};

exports.deleteAirplane = async (req, res, next) => {
    const airplane = await Airplane.findOne({ _id: req.params.id });

    if (airplane.active <= Date.now() || airplane.active == undefined) {
        await airplane.delete();
        res.redirect('/admin/dashboard/airplanes');
    } else {
        req.flash('error', 'airplane is active');
        res.redirect('/account');
    }
};

exports.adminGetEmail = (req, res) => {
    // console.log('email iz querija ' + req.query.email + 'jwt: ' + req.query.jwt);
    //console.log(req.query.jwt);
    // console.log('-----------------------------');
    // console.log(req.cookies['jwt']);
    req.session.email = req.query.email;
    req.session.rank = req.query.rank;

    res.redirect('/admin/dashboard/');
};

exports.adminDashboard = (req, res) => {
    console.log(req.session.email);
    res.render('dashboard');
};

exports.addAirplaneForm = (req, res, next) => {
    res.render('airplaneForm');
};

exports.addFlightForm = async (req, res, next) => {
    const airplanes = await Airplane.find({
        $or: [{ active: { $lt: Date.now() } }, { active: null }],
    });

    res.render('flightForm', { airplanes });
};

exports.getFlights = async (req, res, next) => {
    const flights = await Flight.find().populate('airplane').sort({ departure: 1 }); // da vrati i atribute aviona
    res.render('dashboard', { title: 'Admin Dashboard', flights });
};

exports.getAirplanes = async (req, res, next) => {
    const airplanes = await Airplane.find().sort({ name: 1 });
    res.render('dashboard', { title: 'Admin Dashboard', airplanes });
};

exports.deleteFlight = async (req, res, next) => {
    console.log('aa');
    const flight = await Flight.findOne({ _id: req.params.id }).populate('airplane');
    const airplane = await Airplane.findOne({ _id: flight.airplane.id });
    const resp = await axios.get(
        'http://127.0.0.1:8080/getTicketInfo?id=' + req.params.id.toString()
    );

    if (resp.data === true) {
        await flight.update({ $set: { canceled: true } });
        await airplane.update({ $set: { active: Date.now() } });
        cancelTicket
            .createJob({ id: flight.id })
            .save()
            .then((job) => {
                console.log('dodat posao', job.id);
            });
    } else {
        await flight.update({ $set: { canceled: true } });
        await airplane.update({ $set: { active: Date.now() } });
    }

    res.redirect('/admin/dashboard/flights');
};

cancelTicket.process(async (job) => {
    const resp = await axios.get('http://127.0.0.1:8080/cancelTicket?id=' + job.data.id.toString());

    const airplane = await Flight.findOne({ _id: job.data.id });

    userRank
        .createJob({ id: resp.data, rank: airplane.duration })
        .save()
        .then((job) => {
            console.log('dodat posao rank', job.id);
        });
    sendEmail
        .createJob({ id: resp.data, flight: airplane })
        .save()
        .then((job) => {
            console.log('dodat posao email', job.id);
        });
});

userRank.process(async (job) => {
    let min = Math.floor(job.data.rank / 60000);

    let rank = min * 7;

    const params = new URLSearchParams({
        id: job.data.id,
        rank: rank,
    }).toString();
    const resp = await axios.get('http://127.0.0.1:8080/downgrade/rank?' + params);
    // console.log(resp);
});

sendEmail.process(async (job) => {
    const params = new URLSearchParams({
        id: job.data.id,
        from: job.data.flight.from,
        to: job.data.flight.to,
    }).toString();
    const resp = await axios.get('http://127.0.0.1:8080/sendemail?' + params);
});

exports.logout = (req, res) => {
    const url = 'http://127.0.0.1:8080/logout';
    axios.get(url).then((response) => {
        return res.redirect(response.config.url);
    });
};

exports.account = (req, res) => {
    // const jwt = req.cookies['jwt'];
    // const params = new URLSearchParams({
    //     jwt: jwt,
    // }).toString();
    const url = 'http://127.0.0.1:8080/accountadmin';
    axios
        .get(url)
        .then((response) => {
            res.redirect(response.config.url);
        })
        .catch((err) => {
            console.log(err);
        });
};

exports.flightsInfo = async (req, res) => {
    let flights = [];
    flightIds = req.query.flightIds.split(',');
    console.log(flightIds);
    await Promise.all(
        flightIds.map(async (flight) => {
            flight = await Flight.findOne({ _id: flight });
            flights.push(flight);
        })
    );
    res.send(flights);
};
