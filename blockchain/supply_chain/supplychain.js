const express = require('express');
const router  = express.Router();
const ProduceManagement = require('./ProduceManagement');
const ProduceOwnership = require('./ProduceOwnership');
const ProduceTraceability = require('./ProduceTraceability');
const ProduceTraceabilityV1 = require('./ProduceTraceabilityV1');
const ProduceTraceabilityV2 = require('./ProduceTraceabilityV2');

const {successResponse, errorResponse} = require('../eth/libs/response');

const logStruct = (func, error) => {
    return {'func': func, 'file': 'supplychain', error}
  }

  const registerFarmer = async(data) => {
    try{   
      const reg_frm = await ProduceTraceabilityV2.registerFarmer(data);
      return successResponse(200, reg_frm, 'register v2'); 
    } catch (error) {
    console.error('error -> ', logStruct('registerFarmer', error))
    return errorResponse(error.status, error.message);
  }
  }

  router.post('/reg/v2',  async(req, res, next) => {
    console.log(req.body);
    //const {to, amount} = req.body
    const tx = await registerFarmer(req.body);
  
    return res.status(tx.status).send(tx.data);
});

const verifyFarmer = async(data) => {
    try{   
      const ver_fmr = await ProduceTraceabilityV2.verifyFarmer(data);
      return successResponse(200, ver_fmr, 'verify v2'); 
    } catch (error) {
    console.error('error -> ', logStruct('verifyFarmer', error));
    return errorResponse(error.status, error.message);
  }
  }

  router.post('/ver/v2',  async(req, res, next) => {
    console.log(req.body);
    //const {to, amount} = req.body
    const ver = await verifyFarmer(req.body.address);
  
    return res.status(ver.status).send(ver.data);
});


const addFarmProduce = async(req, res) => {
    try{   
      const add_prd = await ProduceTraceability.addFarmProduce(req.body);
      const product = {
         product : add_prd
      }
      return res.send(product); //successResponse(200, bal_axk, 'balance'); 
    } catch (error) {
    console.error('error -> ', logStruct('addFarmProduce', error))
    return res.send(error.status);
  }
  }

  router.post('/add',  async(req, res, next) => {
    console.log(req.body);
    //const {to, amount} = req.body
    const product = await addFarmProduce(req, res);
  
    return product;
});

const addFarmProduceV2 = async(req, res) => {
  try{   
    const add_prd = await ProduceTraceabilityV2.addFarmProduce(req.body);
    const product = {
       product : add_prd
    }
    return res.send(product); //successResponse(200, bal_axk, 'balance'); 
  } catch (error) {
  console.error('error -> ', logStruct('addFarmProduce v2', error))
  return res.send(error.status);
}
}

router.post('/add/v2',  async(req, res, next) => {
  console.log(req.body);
  //const {to, amount} = req.body
  const product = await addFarmProduceV2(req, res);

  return product;
});

const sellFarmProduce = async(req, res) => {
    try{   
      const sell_pr = await ProduceTraceabilityV2.sellFarmProduce(req.body);
      
      let res_sell = {
         sell : sell_pr
      }
      return res.send(res_sell);//uccessResponse(200, bal_axk, 'tokens available'); 
    } catch (error) {
    console.error('error -> ', logStruct('sellFarmProduce v2', error))
    return res.send(error.status);//errorResponse(error.status, error.message);
  }
  }

  router.post('/sell/v2',  async(req, res, next) => {
    //console.log(req.body);
    //const {to, amount} = req.body
    const sell = await sellFarmProduce(req, res);
  
    return sell;//res.status(balance.status).send(balance.data);
});

const getFarmer = async(req, res) => {
    try{   
      const _farmer = await ProduceTraceabilityV2.getFarmer(req.body.address);
      
      let farmer = {
         farmer : _farmer
      }
      return res.send(farmer);//uccessResponse(200, bal_axk, 'tokens available'); 
    } catch (error) {
    console.error('error -> ', logStruct('getFarmer v1', error))
    return res.send(error.status);//errorResponse(error.status, error.message);
  }
  }

  router.post('/farmer/v2',  async(req, res, next) => {
    //console.log(req.body);
    //const {to, amount} = req.body
    const farmer = await getFarmer(req, res);
  
    return farmer;//res.status(balance.status).send(balance.data);
});

const getProduce = async(req, res) => {
    try{   
      const _produce = await ProduceTraceabilityV2.getProduce(req.body.index);
      
      let produce = {
         produce : _produce
      }
      return res.send(produce);//uccessResponse(200, bal_axk, 'tokens available'); 
    } catch (error) {
    console.error('error -> ', logStruct('getProduce v2', error))
    return res.send(error.status);//errorResponse(error.status, error.message);
  }
  }

  router.post('/produce/v2',  async(req, res, next) => {
    //console.log(req.body);
    //const {to, amount} = req.body
    const produce = await getProduce(req, res);
  
    return produce;//res.status(balance.status).send(balance.data);
});

const getProduceIndex = async(req, res) => {
    try{   
      const _index = await ProduceTraceabilityV2.getProduceIndex(req.body.hash);
      
      let index = {
         index : _index
      }
      return res.send(index);//uccessResponse(200, bal_axk, 'tokens available'); 
    } catch (error) {
    console.error('error -> ', logStruct('getProduceIndex v2', error))
    return res.send(error.status);//errorResponse(error.status, error.message);
  }
  }

  router.post('/index/v2',  async(req, res, next) => {
    //console.log(req.body);
    //const {to, amount} = req.body
    const index = await getProduceIndex(req, res);
  
    return index;//res.status(balance.status).send(balance.data);
});

const getProduceSale = async(req, res) => {
    try{   
      const _sale = await ProduceTraceabilityV2.getProduceSale(req.body.index);
      
      let sale = {
         sale : _sale
      }
      return res.send(sale);//uccessResponse(200, bal_axk, 'tokens available'); 
    } catch (error) {
    console.error('error -> ', logStruct('getProduceSale v2', error))
    return res.send(error.status);//errorResponse(error.status, error.message);
  }
  }

  router.post('/sale/v2',  async(req, res, next) => {
    //console.log(req.body);
    //const {to, amount} = req.body
    const sale = await getProduceSale(req, res);
  
    return sale;//res.status(balance.status).send(balance.data);
});


const getProduceSaleIndex = async(req, res) => {
    try{   
      const _sale = await ProduceTraceabilityV2.getProduceSaleIndex(req.body.index);
      
      let sale = {
         sale : _sale
      }
      return res.send(sale);//uccessResponse(200, bal_axk, 'tokens available'); 
    } catch (error) {
    console.error('error -> ', logStruct('getProduceSaleIndex v2', error))
    return res.send(error.status);//errorResponse(error.status, error.message);
  }
  }

  router.post('/sale/index/v2',  async(req, res, next) => {
    //console.log(req.body);
    //const {to, amount} = req.body
    const sale = await getProduceSaleIndex(req, res);
  
    return sale;//res.status(balance.status).send(balance.data);
});

const currentconsignment = async(req, res) => {
    try{   
      const _hash = await ProduceTraceabilityV2.currentconsignment(req.body.address);
      
      let hash = {
        hash : _hash
      }
      return res.send(hash);//uccessResponse(200, bal_axk, 'tokens available'); 
    } catch (error) {
    console.error('error -> ', logStruct('currentconsignment v2', error))
    return res.send(error.status);//errorResponse(error.status, error.message);
  }
  }

  router.post('/add/hash/v2',  async(req, res, next) => {
    //console.log(req.body);
    //const {to, amount} = req.body
    const hash = await currentconsignment(req, res);
  
    return hash;//res.status(balance.status).send(balance.data);
});


const currentproduct = async(req, res) => {
  try{   
    const _hash = await ProduceTraceabilityV2.currentproduct(req.body.hash);
    
    let hash = {
      hash : _hash
    }
    return res.send(hash);//uccessResponse(200, bal_axk, 'tokens available'); 
  } catch (error) {
  console.error('error -> ', logStruct('currentproduct v2', error))
  return res.send(error.status);//errorResponse(error.status, error.message);
}
}

router.post('/sale/hash/v2',  async(req, res, next) => {
  //console.log(req.body);
  //const {to, amount} = req.body
  const hash = await currentproduct(req, res);

  return hash;//res.status(balance.status).send(balance.data);
});





module.exports = router;