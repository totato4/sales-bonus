/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
  // @TODO: Расчет выручки от операции
  // purchase — это одна из записей в поле items из чека
  // _product — продукт из коллекции data.products (пока не используется)
  const { discount, sale_price, quantity } = purchase;

  // Переводим скидку из процентов в десятичное число
  const discountDecimal = discount / 100;

  // Полная стоимость без скидки
  const fullPrice = sale_price * quantity;

  // Выручка с учётом скидки
  const revenue = fullPrice * (1 - discountDecimal);

  return revenue;
}

/**
 * Функция для расчета бонусов
 * @param index порядковый номер в отсортированном массиве
 * @param total общее число продавцов
 * @param seller карточка продавца
 * @returns {number}
 */
function calculateBonusByProfit(index, total, seller) {
  // @TODO: Расчет бонуса от позиции в рейтинге

  const { profit } = seller;

  let percent = 0;

  if (index === 0) {
    // Первое место (наибольшая прибыль) — 15%
    percent = 15;
  } else if (index === 1 || index === 2) {
    // Второе и третье место — 10%
    percent = 10;
  } else if (index === total - 1) {
    // Последнее место — 0%
    percent = 0;
  } else {
    // Все остальные — 5%
    percent = 5;
  }

  return (profit * percent) / 100;
}

/**
 * Функция для анализа данных продаж
 * @param data
 * @param options
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 */
function analyzeSalesData(data, options) {
  // @TODO: Проверка входных данных

  // Проверяем, что данные корректны
  if (
    !data ||
    !Array.isArray(data.sellers) ||
    data.sellers.length === 0 ||
    !Array.isArray(data.products) ||
    data.products.length === 0 ||
    !Array.isArray(data.purchase_records) ||
    data.purchase_records.length === 0
  ) {
    throw new Error('Некорректные входные данные');
  }

  console.log('Шаг 1: Проверка входных данных пройдена');

  // @TODO: Проверка наличия опций

  // Проверяем, что options существует
  if (!options || typeof options !== 'object') {
    throw new Error('Отсутствуют настройки options');
  }

  // Извлекаем функции из options
  const { calculateRevenue, calculateBonus } = options;

  // Проверяем, что функции переданы
  if (!calculateRevenue || !calculateBonus) {
    throw new Error('Отсутствуют необходимые функции в options');
  }

  // Проверяем, что переданные значения — это действительно функции
  if (typeof calculateRevenue !== 'function') {
    throw new Error('calculateRevenue должна быть функцией');
  }
  if (typeof calculateBonus !== 'function') {
    throw new Error('calculateBonus должна быть функцией');
  }

  console.log('Шаг 2: Проверка опций пройдена');

  // @TODO: Подготовка промежуточных данных для сбора статистики

  // Создаём массив статистики для каждого продавца
  const sellerStats = data.sellers.map((seller) => ({
    id: seller.id,
    name: `${seller.first_name} ${seller.last_name}`,
    revenue: 0, // выручка (доход от продаж)
    profit: 0, // прибыль (выручка - себестоимость)
    sales_count: 0, // количество чеков (продаж)
    products_sold: {}, // объект: { "SKU_001": 5, "SKU_002": 3 }
  }));

  console.log('Шаг 3: Промежуточные данные подготовлены', sellerStats);

  // @TODO: Индексация продавцов и товаров для быстрого доступа

  // Создаём индекс продавцов: id -> объект статистики продавца
  const sellerIndex = {};
  for (const seller of sellerStats) {
    sellerIndex[seller.id] = seller;
  }

  // Создаём индекс товаров: sku -> объект товара из data.products
  const productIndex = {};
  for (const product of data.products) {
    productIndex[product.sku] = product;
  }

  console.log('Шаг 4: Индексация продавцов и товаров пройдена');

  // @TODO: Расчет выручки и прибыли для каждого продавца

  // Проходим по всем чекам
  for (const record of data.purchase_records) {
    // Ищем продавца
    const seller = sellerIndex[record.seller_id];

    // Увеличиваем количество продаж (чеков)
    seller.sales_count += 1;

    // Проходим по всем товарам в чеке
    for (const item of record.items) {
      // Находим товар в каталоге
      const product = productIndex[item.sku];

      // Себестоимость = закупочная цена × количество
      const cost = product.purchase_price * item.quantity;

      // Выручка от товара с учётом скидки (через функцию calculateRevenue)
      const revenue = calculateRevenue(item);

      // Прибыль от товара
      const profit = revenue - cost;

      // Добавляем к выручке продавца
      seller.revenue += revenue; // ← ЭТА СТРОКА БЫЛА ПРОПУЩЕНА

      // Добавляем к прибыли продавца
      seller.profit += profit;

      // Увеличиваем счётчик проданных товаров
      if (!seller.products_sold[item.sku]) {
        seller.products_sold[item.sku] = 0;
      }
      seller.products_sold[item.sku] += item.quantity;
    }
  }

  console.log('Шаг 5: Расчёт выручки и прибыли завершён');

  // @TODO: Сортировка продавцов по прибыли

  // Сортируем продавцов по убыванию прибыли (от большего к меньшему)
  sellerStats.sort((a, b) => b.profit - a.profit);

  console.log('Шаг 6: Сортировка продавцов по прибыли завершена');
  console.log(
    'Отсортированные продавцы:',
    sellerStats.map((s) => ({ name: s.name, profit: s.profit }))
  );
  // @TODO: Назначение премий на основе ранжирования

  // Проходим по отсортированным продавцам
  for (let i = 0; i < sellerStats.length; i++) {
    const seller = sellerStats[i];
    const total = sellerStats.length;

    // 1. Рассчитываем бонус для продавца
    //    i — это индекс (место в рейтинге, где 0 = первое место)
    //    total — общее количество продавцов
    //    seller — объект продавца (нужен для получения profit)
    seller.bonus = calculateBonus(i, total, seller);

    // 2. Формируем топ-10 товаров
    //    Преобразуем объект products_sold в массив
    const productsArray = Object.entries(seller.products_sold);
    //    productsArray имеет вид: [["SKU_001", 5], ["SKU_002", 3], ...]

    //    Преобразуем в нужный формат: [{ sku: "SKU_001", quantity: 5 }, ...]
    const topProducts = productsArray.map(([sku, quantity]) => ({
      sku: sku,
      quantity: quantity,
    }));

    //    Сортируем по убыванию количества (от большего к меньшему)
    topProducts.sort((a, b) => b.quantity - a.quantity);

    //    Берём первые 10 (или меньше, если товаров меньше 10)
    seller.top_products = topProducts.slice(0, 10);
  }

  console.log('Шаг 7: Премии и топ-товары назначены');
  console.log(
    'Продавцы с бонусами:',
    sellerStats.map((s) => ({ name: s.name, bonus: s.bonus }))
  );

  // @TODO: Подготовка итоговой коллекции с нужными полями

  // Преобразуем sellerStats в итоговый отчёт
  const report = sellerStats.map((seller) => ({
    seller_id: seller.id,
    name: seller.name,
    revenue: +seller.revenue.toFixed(2), // 2 знака после запятой, затем преобразуем в число
    profit: +seller.profit.toFixed(2), // 2 знака после запятой
    sales_count: seller.sales_count,
    top_products: seller.top_products,
    bonus: +seller.bonus.toFixed(2), // 2 знака после запятой
  }));

  console.log('Шаг 8: Итоговая коллекция подготовлена');

  // Возвращаем отчёт
  return report;
}
