import '../css/style.css';

import { $, $$ } from './modules/bling';
var today = new Date().toISOString().split('T')[0];

const t = document.getElementsByName("departure")[0].setAttribute('min', today);



document.getElementsByName("return")[0].setAttribute('min', today);

