const Products = require('../models/productModel');

class apiFeature {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filtering(){
    const queryObject = {...this.queryString} // queryString = req.query;
    const excludeFields = ['page', 'sort', 'limit'];
    excludeFields.forEach(field => delete(queryObject[field]));

    let queryString = JSON.stringify(queryObject);
    queryString = queryString.replace(/\b(gte|gt|lt|lte|regex)\b/g, match => '$' + match);

    this.query.find(JSON.parse(queryString))
    return this;
  }
  sorting(){
    if (this.queryString.sort) {
      let sortBy = this.queryString.sort.split(',').join(' ');
      console.log(sortBy)
      this.query = this.query.sort(sortBy);
    }else{
      this.query = this.query.sort("-createAt");
    }
    return this;
  }
  paginating(){
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 9;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

const productController = {
  getProduct: async (req, res) => {
    try {
      const feature = new apiFeature(Products.find(), req.query).filtering().sorting().paginating();
      const products = await feature.query
      res.json({
        status: "success",
        result: products.length,
        products: products
      });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  createProduct: async (req, res) => {
    try {
      const { product_id, title, price, description, content, images, category } = req.body;
      if (!images) {
        res.status(400).json({ msg: 'no image is upload'})
      }
      const product = await Products.findOne({product_id});
      if (product) {
        res.status(400).json({ msg: 'this product already exists'})
      }
      const newProduct = new Products({
        product_id, title:title.toLowerCase(), price, description, content, images, category
      })
      await newProduct.save();
      res.status(200).json({ msg : 'Product is create successfully'})
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  deleteProduct: async (req, res) => {
    try {
      await Products.findByIdAndDelete(req.params.id)
      res.status(200).json({ msg: 'delete product successfully'})
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  updateProduct: async (req, res) => {
    try {
      const { title, price, description, content, images, category } = req.body;
       if (!images) {
         res.status(400).json({ msg: "no image is upload" });
       }
       await Products.findOneAndUpdate({_id:req.params.id}, {
        title:title.toLowerCase(), price, description, content, images, category 
       })
       req.json({ msg:"update this product successfully"})
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = productController;