const { Category } = require('../models/category');
const express = require('express');
const router = express.Router();

//Fetch all categories list details
router.get(`/`, async (req, res) =>{
    const categoryList = await Category.find();

    if(!categoryList){
        res.status(500).json({success: false})
    };
    res.status(200).send(categoryList);
});

//Fetch category details using ID
router.get('/:id', async (req, res) => {
    const category = await Category.findById(req.params.id);

    if(!category){
        return res.status(500).json({message: 'The category with the given ID was not found.'});
    }
    res.status(200).send(category);
});

//Add category details
router.post('/', async (req, res) => {
    let category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color,
    })
    category = await category.save();

    if(!category)
        return res.status(404).send('the category cannot be created!');
    
    res.send(category);
});

//Update Category details
router.put('/:id', async(req, res) => {
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            icon: req.body.icon || category.icon,
            color: req.body.color,
        },
        {
            new: true
        }
    )

    if(!category)
        return res.status(404).send('the category cannot be created!');
    
    res.send(category);

});

//Delete category details
router.delete('/:id', (req, res) => {
    Category.findByIdAndRemove(req.params.id).then(category => {
        if(category){
            return res.status(200).json({ success: true, message: 'the category is deleted!'});
        } else {
            return res.status(404).json({ success : false, message: 'category not found!'});
        }
    }).catch(err => {
        return res.status(400).json({success: false, error: err});
    })
});

module.exports = router;