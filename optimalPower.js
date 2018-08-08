/**
 * Функция расчета оптимальной потребляемой мощности умного дома.
 * @param {Object} input - Объект с входными данными устройст.
 * @param {Array} input.devices - Массив объектов с параметрами устройств.
 * @param {Array} input.rates - Массив объектов тарифных ставок по периодам времени.
 * @param {number} input.maxPower - Максимальная мощность на дискретный период времени (час).
 * @returns {Object} Возвращает объект с 2 свойствами
 *                   Object.schedule объект с работой устройств по часам в течении суток
 *                   Object.consumedEnergy объект с расходами на работу устройств
 */
function findMinimalPower(input) {
  // инициализируем ипользуемые переменные
  let hours = [];
  let consumedEnergy = {
    value: 0,
    devices: {},
  };
  let schedule = {};

  // проверяем, что передали объект
  if (input === undefined || input === null || typeof input !== 'object') throw new Error('Input data must be an object');

  // проверяем свойства объекта
  if (input.devices === undefined || !Array.isArray(input.devices)) throw new Error('Input data must include array of devices');
  if (input.rates === undefined || !Array.isArray(input.rates)) throw new Error('Input data must include array of rates');
  if (input.rates.length === 0) throw new Error(`Array of rates can't be empty`);

  // если устройства пустые, то сразу возвращаем пустой объект
  if (input.devices.length === 0) {
    return {
      schedule: [],
      consumedEnergy: {
        value: 0,
        devices: {},
      },
    };
  }

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

    // Проверяем нет ли уже такого id
    if (consumedEnergy.devices.hasOwnProperty(el.id)) throw new Error(`Device with this id already exist ${el.id}}`);
    consumedEnergy.devices[el.id] = 0;

    // Проверяем данные устройства
    /*
      Можно вынести эту часть в отдельную функцию по вылидации входных данных,
      но по условию задания (соглсано видео от 1 августа) данные должны быть уже отвалидированы
      но на всякий случаю минимальный набор проверок все же должен ьыть
    */

    if (el.power > input.maxPower) throw new Error(`Power of ${el.name} - ${el.power} is bigger then Max Power ${input.maxPower}`);
    if (el.duration < 0 || el.duration > 24) throw new Error(`Duration of ${el.name} - ${el.duration} must be in 0 - 24`);

    // Если режим работы для устройства установлен, то отсекаем лишние часы
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

    // Проверяем нашелся ли свободный диапазон для данного устройства
    if (minIndex === -1) {
      console.log(hours);
      throw new Error(`Power of ${el.name} - ${el.power} is to big for this input data.`);
    }

    /*
      Если продолжительность работы устройства больше диапазона действия тарифа
      и не устновлен режим работы (для упрощения алгоритма :( )),
      то проверяем в какую сторону выгоднее сдвинуть работу устройства
    */
    let lastIndex = minIndex + el.duration > hours.length ? minIndex + el.duration - hours.length : minIndex + el.duration;
    if (el.mode === undefined && hours[lastIndex].value !== hours[minIndex].value) minIndex = findRange(hours, el.power, el.duration, minIndex);
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

// проверяем выгодно ли сдвинуть работу утсройства в меньшую сторону
function findRange(arr, power, duration, minIndex) {
  let rangeIndex = minIndex;
  let prevIndex = 0;
  let nextIndex = 0;

  let minPower = arr[minIndex].value;
  for (let i = minIndex; i < minIndex + duration; i++) {
    index = i >= arr.length ? i - arr.length : i;
    if (arr[index].value > minPower) {
      prevIndex = rangeIndex > 0 ? rangeIndex - 1 : arr.lenth - 1;
      nextIndex = rangeIndex + duration > arr.length ? rangeIndex + duration - arr.length : rangeIndex + duration;
      if (arr[prevIndex].value < arr[nextIndex].value && arr[prevIndex].max >= power) rangeIndex = rangeIndex > 0 ? rangeIndex - 1 : arr.length;
      else break;
    }
  }
  return rangeIndex;
}

module.exports = findMinimalPower;
