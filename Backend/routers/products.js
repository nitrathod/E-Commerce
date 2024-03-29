const { Product } = require("../models/product");
const express = require("express");
const { Category } = require("../models/category");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");

//Validating the allowed upload image types
const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpg": "jpg",
  "image/jpeg": "jpeg",
};

//Upload image using multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("invalid image type");

    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/uploads");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    //configuring file types allowed to upload
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadOptions = multer({ storage: storage });

// Fetch all product list
router.get(`/`, async (req, res) => {
  let filter = {};
  if (req.query.categories) {
    filter = { category: req.query.categories.split(",") };
  }
  const productList = await Product.find(filter).populate("category");

  if (!productList) {
    res
      .status(500)
      .json(
        "Cannot find product, either product does not exist or may be deleted."
      );
  }
  res.send(productList);
});

//Fetch product details using ID
router.get(`/:id`, async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category");

  if (!product) {
    res
      .status(500)
      .json(
        "Cannot find product, either product does not exist or may be deleted."
      );
  }
  res.send(product);
});

// Add product to DB
router.post(`/`, uploadOptions.single("image"), async (req, res) => {
  const category = await Category.findById(req.body.category);

  if (!category) {
    return res.status(400).send("Invalid Category");
  }

  //uploading image and giving path of upload folder
  const fileName = req.file.filename;
  const basePath = `${req.protocol}://${req.get("host")}/public/uploads/${fileName}`;

  let product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: `${basePath}`,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
  });

  product = await product.save();

  if (!product) {
    return res.status(500).send("The product cannot be created.");
  }

  res.send(product);
});

//Update product details
router.put("/:id",uploadOptions.single("image"), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send("Invalid Product ID");
  }
  const category = await Category.findById(req.body.category);

  if (!category) {
    return res.status(400).send("Invalid Category");
  }

  //Finding product
  const product = await Product.findById(req.params.id);
  if(!product){
    return res.status(400).send('Invalid Product Id.');
  }

  //uploading image and giving path of upload folder
  const file = req.file;
  let imagepath;
  if(file){
    const fileName = file.filename;
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/${fileName}`;
    imagepath = `${basePath}`
  } else{
    imagepath = product.image;
  }
  

  let updateProduct = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: imagepath,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    },
    {
      new: true,
    }
  );

  if (!updateProduct) return res.status(404).send("The product cannot be created!");

  res.send(updateProduct);
});

//Delete product details
router.delete("/:id", (req, res) => {
  Product.findByIdAndRemove(req.params.id)
    .then((product) => {
      if (product) {
        return res
          .status(200)
          .json({ success: true, message: "the product is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "product not found!" });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

//Fetching total product count
router.get(`/get/count`, async (req, res) => {
  const productCount = await Product.countDocuments();

  if (!productCount) {
    res.status(500).json({ success: false });
  }

  res.send({
    productCount: productCount,
  });
});

//Filtering product count by featured flag
router.get(`/get/featured/:count`, async (req, res) => {
  const count = req.params.count ? req.params.count : 0;
  const productFeatured = await Product.find({ isFeatured: true }).limit(count);

  if (!productFeatured) {
    res.status(500).json({ success: false });
  }
  res.send(productFeatured);
});

//Uploading multiple images to product gallery

router.put("/gallery-images/:id", uploadOptions.array("images"), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).send("Invalid Product ID");
    }

    const files = req.files;
    let imagesPaths = [];
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
    if(files){
      files.map((file) =>{
        imagesPaths.push(`${basePath}${file.filename}`);
      })
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        images: imagesPaths
      },
      {
        new: true,
      }
    );

    if (!product) return res.status(404).send("The gallery cannot be updated!");

    res.send(product);
  }
);

module.exports = router;
