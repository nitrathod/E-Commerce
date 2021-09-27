const { Product } = require('../models/product')
const express = require('express');
const { Category } = require('../models/category');
const router = express.Router();
const mongoose = require('mongoose');

// Fetch all product list
router.get(`/`, async (req, res) => {
  let filter = {};
  if(req.query.categories){
    filter = {category: req.query.categories.split(',')};
  }
  const productList = await Product.find(filter).populate('category');

  if (!productList) {
    res.status(500).json('Cannot find product, either product does not exist or may be deleted.');
  }
  res.send(productList);
});

//Fetch product details using ID
router.get(`/:id`, async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category');

  if (!product) {
    res.status(500).json('Cannot find product, either product does not exist or may be deleted.');
  }
  res.send(product);
});

// Add product to DB
router.post(`/`, async (req, res) => {

  const category = await Category.findById(req.body.category);

  if(!category){
    return res.status(400).send('Invalid Category');
  }

  let product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: req.body.image,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
  })

  product = await product.save();

  if(!product){
    return res.status(500).send('The product cannot be created.');
  }

  res.send(product);

});

//Update product details
router.put('/:id', async(req, res) => {
  if(!mongoose.isValidObjectId(req.params.id)){
    return res.status(400).send('Invalid Product ID');
  }
  const category = await Category.findById(req.body.category);

  if(!category){
    return res.status(400).send('Invalid Category');
  }

  let product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
      },
      {
          new: true
      }
  )

  if(!product)
      return res.status(404).send('The product cannot be created!');
  
  res.send(product);

});

//Delete product details
router.delete('/:id', (req, res) => {
  Product.findByIdAndRemove(req.params.id).then(product => {
      if(product){
          return res.status(200).json({ success: true, message: 'the product is deleted!'});
      } else {
          return res.status(404).json({ success : false, message: 'product not found!'});
      }
  }).catch(err => {
      return res.status(400).json({success: false, error: err});
  })
});

//Fetching total product count
router.get(`/get/count`, (req, res) => {
  Product.countDocuments().then(count => {
      if (count) {
          return res.status(200).json({ productCount: count });
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

//Filtering product count by featured flag
router.get(`/get/featured/:count`, async (req, res) => {
  const count = req.params.count ? req.params.count : 0;
  const productFeatured = await Product.find({isFeatured: true}).limit(count);

  if (!productFeatured) {
    res.status(500).json({success: false});
  }
  res.send(productFeatured);
});

module.exports = router;