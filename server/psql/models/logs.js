const db = require('./db');
const moment = require('moment');

exports.createLog = async (data) => {
    const createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
    const query = db.write('axk_logs').insert({
      log_id: data.log_id,
      log:  data.log,
      cons_time : data.cons_time || null,
      limit : data.limit,
      flag : data.flag || false,
      created_at: createdAt,
      updated_at: createdAt
    });
    console.info("query -->", query.toQuery())
    return query;
  };