const productModel = require('../models/products');

exports.generateLotNumber = (length)=> {
    const characters = '0123456789';
    let lot_num = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        lot_num += characters[randomIndex];
    }
    let date = moment().format('YYYY/MM/DD');
    console.log(date);
    return lot_num;
  }

exports.createProduct = async (req, res) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const usr = req.user, adm = req.admin;
      let walletid, name;
      if (usr){
        walletid = usr.wallet_id;
        name = usr.user;
      }
      else {
        walletid = adm.wallet_id
        name = adm.user;
      }
      let lote_num = this.generateLotNumber(8);
      req.body.wallet_id = walletid;
      req.body.lot_number =  lote_num;
      const response = await productModel.createProduct(req.body);
      await productModel.createProductCategory({category: req.body.category, name : req.body.name});
      await productModel.productCategorize({product_id : req.body.lot_number, category : req.body.category});
      return res.status(200).json(response);
    } catch (error) {
      console.error('createProduct', error.message);
      return res.status(error.status).json(error.message);
    }
  };