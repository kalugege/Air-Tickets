const fs = require('fs');
const formatt = require('date-fns/format');

// Dump is a handy debugging function we can use to sort of "console.log" our data
exports.dump = (obj) => JSON.stringify(obj, null, 2);

// inserting an SVG
exports.icon = (name) => fs.readFileSync(`./public/images/icons/${name}.svg`);

exports.siteName = 'Airplane tickets';

exports.msToTime = (duration) => {
    let milliseconds = parseInt((duration % 1000) / 100),
        seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    return `${hours}h ${minutes}m`;
};

exports.format = formatt;

exports.dayOfWeek = (date) => {
    //Create an array containing each day, starting with Sunday.
    var weekdays = new Array('Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat');
    //Use the getDay() method to get the day.
    var day = date.getDay();
    //Return the element that corresponds to that index.
    return weekdays[day];
};

exports.datesAreOnSameDay = (first, second) =>
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate();

exports.menu = [
    { slug: '/flights', title: 'All flights', icon: 'flight' },
    { slug: '/mytickets', title: 'My tickets', icon: 'ticket' },
    // { slug: '/top', title: 'Top', icon: 'top' },
    // { slug: '/add', title: 'Add', icon: 'add' },
    // { slug: '/map', title: 'Map', icon: 'map' },
];
