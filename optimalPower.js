function findMinimalPower(input) {
  // инициализируем ипользуемые переменные
  let hours = [];
  let consumedEnergy = {
    value: 0,
    devices: {},
  };
  let schedule = {};

  // Сортируем входные данные по потребляемой элетроэнергии
  let sorted = input.devices.sort((a, b)=>a.duration * a.power < b.duration * b.power);

  // Разбиваем тарифы на минимальные дискретные периоды, с учетом условий задачи - это часы
  input.rates.forEach(rate=>{
    let index = 0;
    let start = rate.from;
    let end = rate.to < rate.from ? 24 + rate.to : rate.to;
    for (let i = 0; i < end - start; i++) {
      index = start + i > 23 ? start + i - 24 : start + i;
      hours.push({
        index,
        max: input.maxPower,
        value: rate.value,
      });
    }
  });

  // Проходим массив устройств, заранее отсотрированных по потреблентю
  sorted.forEach(el=>{
    // инициализируем ипользуемые переменные
    let start = 0;
    let end = 24;
    let minIndex = 0;
    let index = 0;
    consumedEnergy.devices[el.id] = 0;


    if (el.mode === 'day') {
      start = 0;
      end = 13;
    } else if (el.mode === 'night') {
      start = 14;
      end = 24;
    }

    // ищем индекс с минимальным значением подходящим по мощности
    minIndex = hours.findIndex(
      e=>e.value === Math.min(
        ...hours.slice(start, end).filter(e => e.max > el.power).map(e => e.value),
      ),
    );

    /*
      Отдельная функция поиска минимального значения на больших входящих массивах
      будет довать прирост в производительности, но скорее всего для любого умного дома количество
      устройств никода не будет на столько большим, по-этому для удобства чтения оставляем вариант
      с использованием встроенных функция обработки массивов JS.
    */
    // minIndex = findMinimumIndex(hours, start, end, el.power);

    /*
      решаем с помощью "жадного" алгоритма
      Самые "потребляющие" устройства выставляем в самые "дешевые" периоды,
      но с учетом режимов "день\ночь"
    */
    for (let i = minIndex; i < minIndex + el.duration; i++) {
      index = i >= hours.length ? i - hours.length : i;
      // Уменьшаем количество максимальной энергии на используемое в этот период
      hours[index].max -= el.power;
      if (!Array.isArray(hours[index].id)) hours[index].id = [];
      hours[index].id.push(el.id);
      consumedEnergy.devices[el.id] += el.power * hours[index].value / 1000;
    }
    consumedEnergy.value += consumedEnergy.devices[el.id];
  });

  // формируем выходной объект согласно условию задачи
  for (let i = 0; i < 24; i++) {
    schedule[hours[i].index] = hours[i].id;
  }
  return {
    schedule,
    consumedEnergy,
  };
}

/*
  Функуия уменьшающая количество циклов и занимаемой памяти при поиске
  минимального индекса. На тестовых данных никакого приросто скорости не дает
*/
function findMinimumIndex(arr, start, end, power) {
  let min = arr[start].value;
  let index = start;
  for (let i = start; i < end; i++) {
    if (arr[i].max >= power) {
      if (arr[i].value < min) {
        min = arr[i].value;
        index = i;
      }
    }
  }
  return index;
}

module.exports = findMinimalPower;
