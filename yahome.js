const input = require('./data.js');
const findMinimalPower = require('./optimalPower');
const time = process.hrtime();
const NS_PER_SEC = 1e9;
const NS_PER_MILL = 1e6;

console.log(findMinimalPower(input));
const diff = process.hrtime(time);
console.log(`Функция выполнила расчет за  ${(diff[0] * NS_PER_SEC + diff[1]) / NS_PER_MILL} миллисекунд`);
