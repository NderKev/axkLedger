const db = require('./db');
const moment = require('moment');

exports.createUserKycInfo = async (data) => {
    const createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
    const query = db.write('axk_kyc_info').insert({
      user_id: data.user_id,
      name: data.name,
      dob: data.dob,
      nationality: data.nationality,
      gender: data.gender || "male",
      phone: data.phone,
      email: data.email,
      address: data.address,
      residence: data.residence,
      kyc_status : data.status || false,
      created_at: createdAt,
      updated_at: createdAt
    });
    console.info("query -->", query.toQuery())
    return query;
  };

  exports.createUserKycDocuments = async (data) => {
    const createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
    const query = db.write('axk_kyc_info').insert({
      user_id: data.user_id,
      url: data.url,
      id_passport: data.id_passport,
      issue: data.issue,
      expiry: data.expiry,
      selfie: data.selfie,
      proof: data.proof,
      created_at: createdAt,
      updated_at: createdAt
    });
    console.info("query -->", query.toQuery())
    return query;
  };


  exports.addFarmerKycInfo = async (data) => {
    const createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
    const query = db.write('axk_kyc_farmers').insert({
      farmer_id: data.farmer_id,
      location:  data.location,
      created_at: createdAt,
      updated_at: createdAt
    });
    console.info("query -->", query.toQuery())
    return query;
  };


  exports.addKycConsent = async (data) => {
    const createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
    const query = db.write('axk_kyc_consent').insert({
      cons_id: data.cons_id,
      cons_consent:  true,
      cons_time : data.cons_time || null,
      cons_version : data.cons_version,
      created_at: createdAt,
      updated_at: createdAt
    });
    console.info("query -->", query.toQuery())
    return query;
  };

  exports.createBusinessKyc = async (data) => {
    const createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
    const query = db.write('axk_kyc_info').insert({
      biz_name: data.name,
      biz_type: data.type,
      biz_reg_no: data.reg_no,
      biz_address: data.address,
      biz_id: data.bid,
      biz_funding: data.funding,
      biz_tax_id: data.tax_id,
      biz_bank: data.bank,
      biz_statement: data.statement,
      biz_kyc_status : data.status || false,
      created_at: createdAt,
      updated_at: createdAt
    });
    console.info("query -->", query.toQuery())
    return query;
  };


  exports.createCorporateKyc = async (data) => {
    const createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
    const query = db.write('axk_kyc_info').insert({
      corp_name: data.name,
      corp_type: data.type,
      corp_reg_no: data.reg_no,
      corp_contact: data.contact,
      corp_contact_id: data.contact_id,
      corp_address: data.address,
      corp_revenue: data.revenue,
      corp_tax_id: data.tax_id,
      corp_bank: data.bank,
      corp_statement: data.statement,
      corp_kyc_status : data.status || false,
      created_at: createdAt,
      updated_at: createdAt
    });
    console.info("query -->", query.toQuery())
    return query;
  };


  