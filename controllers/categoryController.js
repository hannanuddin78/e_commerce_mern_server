const Category = require('../models/categoryModel');

const categoryController = {
  getCategory: async (req, res) => {
    try {
      const categories = await Category.find();
      res.json(categories);
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  createCategory: async (req, res) => {
    try {
      // if user have role = 1 ---> admin
      // only admin can create , delete and update category
      const { name } = req.body;
      const isMatchCt = await Category.findOne({ name });
      if (isMatchCt) {
        return res.status(400).json({ msg: "this category is already exists" });
      }
      const newCategory = new Category({ name });
      await newCategory.save();
      res.json({ msg: "this category has been created" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  deleteCategory: async (req, res) => {
      try {
          await Category.findByIdAndDelete(req.params.id)
          res.json({ msg: "delete category"})
      } catch (error) {
        return res.status(500).json({ msg: error.message });  
      }
  },
  updateCategory:async (req, res) => {
    try {
      const { name } = req.body;
      await Category.findOneAndUpdate({_id:req.params.id}, {name:name});
      res.json({ msg: "update category"})
    } catch (error) {
      return res.status(500).json({ msg: error.message }); 
    }
  }
};

module.exports = categoryController;