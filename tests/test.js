const assert = require('assert');
const findMinimalPower = require('../optimalPower');

const input = require('../data');
const output = findMinimalPower(input);

describe('Проверяем выходные данные с входными из задания', function () {
  it('Проверяем что функция возрвщает объект', function () {
    assert.equal(output.toString(), '[object Object]');
  });
  it('Проверяем что есть есть свойство schedule', function () {
    assert.equal(output.schedule !== undefined, 'H');
  });
});
