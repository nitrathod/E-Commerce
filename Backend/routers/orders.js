const { Order } = require("../models/order");
const express = require("express");
const { OrderItem } = require("../models/order-item");
const router = express.Router();

//fetching all order details
router.get(`/`, async (req, res) => {
  //Fins user and then populate user name along with news order sorting on top
  const orderList = await Order.find()
    .populate("user", "name")
    .sort({ dateOrdered: -1 });

  if (!orderList) {
    res.status(500).json({ success: false });
  }
  res.send(orderList);
});

//Fetching specific user name using id
router.get(`/:id`, async (req, res) => {
  //Fins user by ID and then populate user name.
  const order = await Order.findById(req.params.id)
    .populate("user", "name")
    //displaying order items details, product details and category details using popolate
    .populate({ 
        path: "orderItems", 
        populate: 
        {
            path: 'product',
            populate: 'category'
        } 
    
    });

  if (!order) {
    res.status(500).json({ success: false });
  }
  res.send(order);
});

//Add order
router.post("/", async (req, res) => {
  const orderItemsIds = Promise.all(
    req.body.orderItems.map(async (orderItem) => {
      let newOrderItem = new OrderItem({
        quantity: orderItem.quantity,
        product: orderItem.product,
      });

      newOrderItem = await newOrderItem.save();

      return newOrderItem._id;
    })
  );

  //created extra variable to handle promises
  const orderItemsIdsResolved = await orderItemsIds;

  const totalPrices = await Promise.all(orderItemsIdsResolved.map( async (orderItemId) => {
    const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');
    const totalPrice = orderItem.product.price * orderItem.quantity;
    return totalPrice;
  }))

  const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

  let order = new Order({
    orderItems: orderItemsIdsResolved,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
    status: req.body.status,
    totalPrice: totalPrice,
    user: req.body.user,
  });
  order = await order.save();

  if (!order) return res.status(404).send("the order cannot be created!");

  res.send(order);
});

//Update order status
router.put('/:id', async(req, res) => {
  const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
          status: req.body.status
      },
      {
          new: true
      }
  )

  if(!order)
      return res.status(404).send('the order cannot be updated!');
  
  res.send(order);

});

//Delete order
router.delete('/:id', (req, res) => {
 Order.findByIdAndRemove(req.params.id).then(async order => {
      if(order){
        await order.orderItems.map(async orderItems => {
          await OrderItem.findByIdAndRemove(orderItems);
        })
          return res.status(200).json({ success: true, message: 'the order is deleted!'});
      } else {
          return res.status(404).json({ success : false, message: 'order not found!'});
      }
  }).catch(err => {
      return res.status(400).json({success: false, error: err});
  })
  
});

//Fetch total sales details
router.get('/get/totalsales', async(req, res) => {
    const totalSales = await Order.aggregate([
      { $group: {_id: null, totalsales: { $sum: '$totalPrice'}}}
    ])

    if(!totalSales){
      return res.status(400).send('The order sales cannot be generated');
    }

    res.send({totalsales: totalSales.pop().totalsales})
})

//Fetching total order count
router.get(`/get/count`, (req, res) => {
  Order.countDocuments().then(count => {
      if (count) {
          return res.status(200).json({ orderCount: count });
      } else {
          return res.status(500).json({ success: false });
      }
  }).catch(err => {
      return res.status(400).json({
          success: false,
          error: err
      })
  });
})

module.exports = router;
