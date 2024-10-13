const moment = require('moment');
const config = require('../config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const salt = await bcrypt.genSalt(10);

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  if (config.NODE_ENV === "production"){
  const timeNow = moment().format('YYYY-MM-DD HH:mm:ss');
  var timestampNow = Math.floor(Date.now() / 1000);
  await knex('axk_user_role').del();
  await knex('axk_user_role').insert([
    {id: 1, role: 'admin', created_at: timeNow, updated_at: timeNow},
    {id: 2, role: 'farmer', created_at: timeNow, updated_at: timeNow},
    {id: 3, role: 'buyer', created_at: timeNow, updated_at: timeNow}
  ]);
  await knex('axk_users').where('id', '=', 1).del();
  const _password = bcrypt.hashSync(String(config.ADMIN_PW), salt);
  await knex('axk_user_role').insert([
    {id : 1, name: config.ADMIN_NAME, email : config.ADMIN_EMAIL, password : _password, wallet_id : config.ADMIN_WID, created_at: timeNow, updated_at: timeNow}
  ]);
  await knex('axk_user_permission').where('role_id', '=', 1).del();
  await knex('axk_user_permission').insert([
    {wallet_id: config.ADMIN_WID, role_id : 1, created_at: timeNow, updated_at: timeNow}
  ]);

  const adm_token = function(payload){
  try {
  var adm_tkn = {};
  jwt.sign({
    data : {
      wallet_id: payload.user,
      user: payload.pass,
      role: payload.role
    }
  }, config.ADM_SECRET,
    { expiresIn: '1h' },
    (err, token) => {
      if (err) throw err;
      adm_tkn.token = token
    },
  );
  return adm_tkn;
 } catch(err){
    tk.error = err.message;
    return  err.message;
}
};
const token = adm_token({user : config.ADMIN_WID, pass : config.ADMIN_NAME, role : "admin"});
const token_expiry = timestampNow + 3600;
await knex('axk_auth_jwt').where('wallet_id', '=', config.ADMIN_WID).del();
await knex('axk_auth_jwt').insert([
  {wallet_id: config.ADMIN_WID, expiration : token_expiry, token : token.token, created_at: timeNow, updated_at: timeNow}
]);
}
};
