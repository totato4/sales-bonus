/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
  // purchase — это одна из записей в поле items из чека
  const { discount, sale_price, quantity } = purchase;

  // Выручка с учётом скидки (скидка в процентах)
  return sale_price * quantity * (1 - discount / 100);
}

/**
 * Функция для расчета бонусов
 * @param index порядковый номер в отсортированном массиве
 * @param total общее число продавцов
 * @param seller карточка продавца
 * @returns {number}
 */
function calculateBonusByProfit(index, total, seller) {
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
  // ==================== ШАГ 1: ПРОВЕРКА ВХОДНЫХ ДАННЫХ ====================
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

  // ==================== ШАГ 2: ПРОВЕРКА НАЛИЧИЯ ОПЦИЙ ====================
  if (!options || typeof options !== 'object') {
    throw new Error('Отсутствуют настройки options');
  }

  const { calculateRevenue, calculateBonus } = options;

  if (!calculateRevenue || !calculateBonus) {
    throw new Error('Отсутствуют необходимые функции в options');
  }

  if (typeof calculateRevenue !== 'function') {
    throw new Error('calculateRevenue должна быть функцией');
  }
  if (typeof calculateBonus !== 'function') {
    throw new Error('calculateBonus должна быть функцией');
  }

  console.log('Шаг 2: Проверка опций пройдена');

  // ==================== ШАГ 3: ПОДГОТОВКА ПРОМЕЖУТОЧНЫХ ДАННЫХ ====================
  const sellerStats = data.sellers.map((seller) => ({
    id: seller.id,
    name: `${seller.first_name} ${seller.last_name}`,
    revenue: 0,
    profit: 0,
    sales_count: 0,
    products_sold: {},
  }));

  console.log('Шаг 3: Промежуточные данные подготовлены', sellerStats);

  // ==================== ШАГ 4: ИНДЕКСАЦИЯ ПРОДАВЦОВ И ТОВАРОВ ====================
  const sellerIndex = {};
  for (const seller of sellerStats) {
    sellerIndex[seller.id] = seller;
  }

  const productIndex = {};
  for (const product of data.products) {
    productIndex[product.sku] = product;
  }

  console.log('Шаг 4: Индексация продавцов и товаров пройдена');

  // ==================== ШАГ 5: РАСЧЁТ ВЫРУЧКИ И ПРИБЫЛИ ====================
  for (const record of data.purchase_records) {
    const seller = sellerIndex[record.seller_id];

    seller.sales_count += 1;

    for (const item of record.items) {
      const product = productIndex[item.sku];
      const cost = product.purchase_price * item.quantity;
      const revenue = calculateRevenue(item);
      const profit = revenue - cost;

      seller.revenue += revenue;
      seller.profit += profit;

      if (!seller.products_sold[item.sku]) {
        seller.products_sold[item.sku] = 0;
      }
      seller.products_sold[item.sku] += item.quantity;
    }
  }

  console.log('Шаг 5: Расчёт выручки и прибыли завершён');

  // ==================== ШАГ 6: СОРТИРОВКА ПРОДАВЦОВ ПО ПРИБЫЛИ ====================
  sellerStats.sort((a, b) => b.profit - a.profit);

  console.log('Шаг 6: Сортировка продавцов по прибыли завершена');
  console.log(
    'Отсортированные продавцы:',
    sellerStats.map((s) => ({ name: s.name, profit: s.profit }))
  );

  // ==================== ШАГ 7: НАЗНАЧЕНИЕ ПРЕМИЙ НА ОСНОВЕ РАНЖИРОВАНИЯ ====================
  for (let i = 0; i < sellerStats.length; i++) {
    const seller = sellerStats[i];
    const total = sellerStats.length;

    // Рассчитываем бонус
    seller.bonus = calculateBonus(i, total, seller);

    // Формируем топ-10 товаров
    const productsArray = Object.entries(seller.products_sold);
    const topProducts = productsArray.map(([sku, quantity]) => ({
      sku: sku,
      quantity: quantity,
    }));

    // Сортировка: сначала по количеству (убывание), потом по SKU (возрастание)
    topProducts.sort((a, b) => {
      if (a.quantity !== b.quantity) {
        return b.quantity - a.quantity;
      }
      return a.sku.localeCompare(b.sku);
    });

    seller.top_products = topProducts.slice(0, 10);
  }

  console.log('Шаг 7: Премии и топ-товары назначены');
  console.log(
    'Продавцы с бонусами:',
    sellerStats.map((s) => ({ name: s.name, bonus: s.bonus }))
  );

  // ==================== ШАГ 8: ПОДГОТОВКА ИТОГОВОЙ КОЛЛЕКЦИИ ====================
  const report = sellerStats.map((seller) => ({
    seller_id: seller.id,
    name: seller.name,
    revenue: +seller.revenue.toFixed(2),
    profit: +seller.profit.toFixed(2),
    sales_count: seller.sales_count,
    top_products: seller.top_products,
    bonus: +seller.bonus.toFixed(2),
  }));

  console.log('Шаг 8: Итоговая коллекция подготовлена');

  return report;
}
