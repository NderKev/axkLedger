const db = require('../models/db');
const moment = require('moment');


exports.createProduct = async (data) => {
  const createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
  const query = db.write('axk_products').insert({
    farmer_id: data.farmer_id,
    lot_number: data.lot_number,
    name: data.name,
    image: data.image || null,
    price: data.price,
    currency: data.currency,
    quantity: data.quantity,
    quality: data.quality,
    available: data.available || 1,
    latitude: data.latitude || null,
    longitude: data.longitude || null,
    created_at: createdAt,
    updated_at: createdAt
  });
  console.info("query -->", query.toQuery())
  return query;
};

exports.updateProduct = async (data) => {
  data.updated_at = moment().format('YYYY-MM-DD HH:mm:ss');
  const toBeUpdated = {};
  const canBeUpdated = ['name','image', 'currency', 'quantity',
'quality', 'available', 'latitude', 'longitude'];
  for (let i in data) {
    if (canBeUpdated.indexOf(i) > -1) {
      toBeUpdated[i] = data[i];
    }
  }
  const query = db.write('axk_products')
    .where('lot_number', data.lot_number)
    .update(toBeUpdated);

  console.info("query -->", query.toQuery())
  return query;
};

exports.removeProduct = async (id) => {
  const query = db.write('axk_products')
    .where('id', id)
    .update({
      available: 0,
      updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
    });
  console.info("query -->", query.toQuery())
  return query;
};

exports.reAddProduct = async (id) => {
  const query = db.write('axk_products')
    .where('id', id)
    .update({
      available: 1,
      updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
    });
  console.info("query -->", query.toQuery())
  return query;
};

exports.getDetailsByLoteNumber = async (lote) => {
  const query = db.read.select('*')
  .from('axk_products')
  .where('lote_number', '=', lote);
  return query;
};


exports.getNameByLoteNumber = async (lote) => {
  const query = db.read.select('axk_products.name','axk_products.image')
  .from('axk_products')
  .where('lote_number', '=', lote);
  return query;
};

exports.getAllProducts = async () => {
  const query = db.read.select('*')
  .from('axk_products');

  //console.info("query -->", query.toQuery())
  return query;
};

exports.getAllProductsByFarmerId = async (farmer_id) => {
  const query = db.read.select('*')
  .from('axk_products')
  .where('farmer_id', '=', farmer_id);
  //console.info("query -->", query.toQuery())
  return query;
};


exports.getCategoryNameById = async (id) => {
  const query = db.read.select('paxk_product_category.category')
  .from('axk_product_category')
  .join('axk_product_categorized','axk_product_categorized.category_id','=','axk_product_category.id')
  .where('axk_product_categorized.product_id', '=', id);
  return query;
};

exports.getProdCategories = async () => {
  const query = db.read.select('*')
  .from('axk_product_category');
  return query;
};

exports.createProductCategory = async (data) => {
  const createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
  const query = db.write('axk_product_category').insert({
    category: data.category,
    name: data.name,
    created_at: createdAt,
    updated_at: createdAt
  });
  console.info("query -->", query.toQuery())
  return query;
};

exports.getCategoryById = async (id) => {
  const query = db.read.select('axk_product_categorized.category_id')
  .from('axk_product_categorized')
  //.join('product_category','product_category.id','=','product_categorized.category_id')
  .where('axk_product_categorized.product_id', '=', id);
  return query;
};

exports.productCategorize = async (data) => {
  const createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
  const query = db.write('axk_product_categorized').insert({
    product_id: data.product_id,
    category: data.category,
    created_at: createdAt,
    updated_at: createdAt
  });
  console.info("query -->", query.toQuery())
  return query;
};


exports.getProductCategory = async (id) => {
  const query = db.read.select('category')
  .from('axk_product_categorized')
  .where('product_id', '=', id);
  return query;
};
