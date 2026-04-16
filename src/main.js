/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
  // purchase — это одна из записей в поле items из чека в data.purchase_records
  // _product — это продукт из коллекции data.products
  const { discount, sale_price, quantity } = purchase;
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
}

/**
 * Функция для анализа данных продаж
 * @param data
 * @param options
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 */
function analyzeSalesData(data, options) {
  // Здесь проверим входящие данные
  const { calculateRevenue, calculateBonus } = options; // Сюда передадим функции для расчётов

  const sellerStats = data.sellers.map((seller) => ({
    id: seller.id,
    name: `${seller.first_name} ${seller.last_name}`,
    revenue: 0,
    profit: 0,
    sales_count: 0,
    products_sold: {},
  }));

  console.log('здесь собрана статистика по продавцам!', sellerStats);

  const sellerIndex = {};

  for (const seller of sellerStats) {
    // seller - это каждый объект продавца из массива
    // seller.id - это ключ (например "seller_1")
    // seller - это значение (весь объект продавца)
    sellerIndex[seller.id] = seller;
  }

  console.log('это коллекция продавцов!', sellerIndex);

  const productIndex = {};
  for (const product of data.products) {
    productIndex[product.sku] = product;
  }

  console.log(
    'это коллекция товаров! Для быстрого поиска через свойство объекта (вот такие скобочки productIndex[])',
    productIndex
  );

  console.log('Проверка: найдем товар SKU_001', productIndex['SKU_001']);

  // Здесь посчитаем промежуточные данные и отсортируем продавцов

  // Вызовем функцию расчёта бонуса для каждого продавца в отсортированном массиве

  // Сформируем и вернём отчёт

  // @TODO: Проверка входных данных
  // @TODO: Проверка наличия опций
  // @TODO: Подготовка промежуточных данных для сбора статистики
  // @TODO: Индексация продавцов и товаров для быстрого доступа
  // @TODO: Расчет выручки и прибыли для каждого продавца
  // @TODO: Сортировка продавцов по прибыли
  // @TODO: Назначение премий на основе ранжирования
  // @TODO: Подготовка итоговой коллекции с нужными полями
}
