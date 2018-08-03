const expect = require('chai').expect;
const assert = require('chai').assert;

const findMinimalPower = require('../optimalPower');

const input = require('../data');
const output = findMinimalPower(input);

describe('Проверяем обработку входных данных', function () {
  let testDevices = {};
  let testRates = {
    devices: [],
    rates: "Должен быть массив"
  };
  let testEmptyRates =  {
    devices: [],
    rates: [],
  };
  it('Не принимает undefined', function () {
    expect(()=>{findMinimalPower()}).to.throw('Input data must be an object');
  });

  it('Не принимает строку', function () {
    expect(()=>{findMinimalPower('Не верные данные')}).to.throw('Input data must be an object');
  });

  it('Есть свойство devices', function () {
    expect(()=>{findMinimalPower(testDevices)}).to.throw('Input data must include array of devices');
  });

  it('Есть свойство rates', function () {
    expect(()=>{findMinimalPower(testRates)}).to.throw('Input data must include array of rates');
  });

  it('Массив rates не может быть пустым', function () {
    expect(()=>{findMinimalPower(testEmptyRates)}).to.throw(`Array of rates can't be empty`);
  });
});

describe('Проверяем выходные данные с входными из задания', function () {
  it('Возрвращает объект', function () {
    assert.typeOf(output, 'object');
  });

  it('Есть свойство schedule', function () {
    assert.notEqual(output.schedule, undefined);
  });

  it('Есть свойство consumedEnergy', function () {
    assert.notEqual(output.consumedEnergy, undefined);
  });

  it('Общий расход на электроэнергию равен 38.94 рублей', function () {
    assert.equal(output.consumedEnergy.value.toFixed(2), 38.94);
  });

  it('Расходы на работу посудомоечной машины равны 5.10 рублей', function () {
    assert.equal(output.consumedEnergy.devices['F972B82BA56A70CC579945773B6866FB'], 5.1015);
  });
});
