/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
  const { discount, sale_price, quantity } = purchase;

  // коэффициент скидки
  const discountFactor = 1 - discount / 100;

  // подсчет выручки
  const revenue = sale_price * quantity * discountFactor;
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
  const { profit } = seller;

  if (index === 0) {
    return (profit * 15) / 100;
  } else if (index === 1 || index === 2) {
    return (profit * 10) / 100;
  } else if (index === total - 1) {
    return 0;
  } else {
    return (profit * 5) / 100;
  }
}

/**
 * Функция для анализа данных продаж
 * @param data
 * @param options
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 */
function analyzeSalesData(data, options) {
  // @TODO: Проверка входных данных
  // @TODO: Проверка наличия опций
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

  // ===== ПРОВЕРКА НАЛИЧИЯ ОПЦИЙ =====
  if (!options || typeof options !== 'object') {
    throw new Error('Отсутствуют настройки options');
  }
  // ВЫТАСКИВАЮ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ, НАВЕРНО ОНИ НУЖНЫ ДЛЯ РАЗДЕЛЕНИЯ ЛОГИКИ, ЧТОБЫ НЕ БЫЛА СЛИШКОМ ГРОМОЗДКАЯ И НЕЧИТАЕМАЯ БОЛЬШАЯ ФУНКЦИЯ, ХОТЯ ОНА ВСЕРАВНО ГРОМОЗДКАЯ И НЕЧИТАЕМАЯ =D
  const { calculateRevenue, calculateBonus } = options;
  //  проверки вспомогательных функций на ошибку
  if (!calculateRevenue || !calculateBonus) {
    throw new Error('Отсутствуют необходимые функции в options');
  }

  if (typeof calculateRevenue !== 'function' || typeof calculateBonus !== 'function') {
    throw new Error('calculateRevenue и calculateBonus должны быть функциями');
  }

  // @TODO: Подготовка промежуточных данных для сбора статистики
  // Здесь я типа объекты продавцов создаю, где будет вся статистика высчитываться и тут собираться
  const sellerStats = data.sellers.map((seller) => ({
    id: seller.id,
    name: `${seller.first_name} ${seller.last_name}`,
    revenue: 0,
    profit: 0,
    sales_count: 0,
    products_sold: {},
  }));

  console.log('здесь собрана статистика по продавцам!', sellerStats);

  // @TODO: Индексация продавцов и товаров для быстрого доступа
  // Здесь вообщем можно через скобы [] быстро ОБРАЩАТЬСЯ к нужному продавцу, а не ИСКАТЬ через find метод и тд.
  const sellerIndex = sellerStats.reduce((result, seller) => {
    result[seller.id] = seller;
    return result;
  }, {});

  console.log('это коллекция продавцов!!!!', sellerIndex);
  // ТОЖЕ САМОЕ, только для товаров
  const productIndex = data.products.reduce((result, product) => {
    result[product.sku] = product;
    return result;
  }, {});

  console.log(
    'это коллекция товаров! Для быстрого поиска через свойство объекта (вот такие скобочки productIndex[])',
    productIndex
  );

  console.log('Проверка: найдем товар SKU_001', productIndex['SKU_001']);

  // @TODO: Расчет выручки и прибыли для каждого продавца
  //  перебор чеков и покупок в них
  data.purchase_records.forEach((record) => {
    // нашел продавца который учавстовал в продаже в данном (одном) чеке
    const seller = sellerIndex[record.seller_id];
    // увеличивает количество продаж на один (так как один чек = одна продажа)
    seller.sales_count = seller.sales_count + 1;

    // Перебираем все товары в чеке
    record.items.forEach((item) => {
      // Находим товар по индексу
      const product = productIndex[item.sku];

      // Выручка по формуле (используем переданную функцию)
      const revenue = calculateRevenue(item);

      // Себестоимость = цена закупки × количество товара из чека
      const cost = product.purchase_price * item.quantity;

      // Прибыль = выручка - себестоимость
      const profit = revenue - cost;

      // Накопливаем выручку и прибыль у продавца
      seller.revenue += revenue;
      seller.profit += profit;

      // Собираем статистику по товарам для топ-10
      if (!seller.products_sold[item.sku]) {
        seller.products_sold[item.sku] = 0;
      }
      seller.products_sold[item.sku] += item.quantity;
    });
  });

  console.log('после того как пробежался по чекам изменение в sellerIndex:', sellerIndex);

  // @TODO: Сортировка продавцов по прибыли
  // ОТСОРТИРОВАН ПО ПРОФИТУ (profit) у статистики продавцов
  const sortedSellerStats = sellerStats.sort((a, b) => b.profit - a.profit);
  console.log('Это ОТСОРТИРОВАННЫЙ SELLERSTATS', sortedSellerStats);

  // @TODO: Назначение премий на основе ранжирования
  // Считаем бонус для продавцов

  sortedSellerStats.forEach((seller, index) => {
    seller.bonus = calculateBonus(index, sortedSellerStats.length, seller);
    console.log('Продавцы с бонусами:', sortedSellerStats);

    // ===== ТОП-10 ПРОДУКТОВ =====
    const productsArray = Object.entries(seller.products_sold);
    const topProducts = productsArray.map(([sku, quantity]) => ({ sku, quantity }));
    topProducts.sort((a, b) => b.quantity - a.quantity);
    seller.top_products = topProducts.slice(0, 10);
  });

  console.log('после топ 10 продуктов, смотри top_products', sortedSellerStats);

  // @TODO: Подготовка итоговой коллекции с нужными полями
  // ===== ЭТО ИТОГОВЫЙ ОТЧЕТ =====
  const report = sortedSellerStats.map((seller) => ({
    seller_id: seller.id,
    name: seller.name,
    revenue: +seller.revenue.toFixed(2),
    profit: +seller.profit.toFixed(2),
    sales_count: seller.sales_count,
    top_products: seller.top_products,
    bonus: +seller.bonus.toFixed(2),
  }));

  console.log('Итоговый отчет:', report);
  return report;
}
