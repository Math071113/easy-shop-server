const express = require('express')
const router = express.Router()

// Model
const Category = require('../models/category.js')

router.get('/', async (req, res) => {
    try {
        const categories = await Category.find()
        return res.json(categories)

    } catch(err) {
        console.log(err)
        return res.status(500).json({ Message: 'Internal Server Error' })
    }
})

router.get('/:id', async (req, res) => {
    const { id } = req.params
    try {
        const category = await Category.findOne({ id })
        if(category) return res.json(category)
        return res.status(404).json({ Success: false, Message: 'Category not found' })
    } catch(err) {
        console.log(err)
        return res.status(500).json({ Success: false, Message: 'Internal Server Error' })
    }
} )

router.post('/', async (req, res) => {
    let category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    })
    try{    
        const result = await category.save()
        if(!result) return res.status(404).json({ Success: false, Message: 'The category cannot be created'})
        return res.json(result)
    } catch(err){
        console.log(err)
        return res.status(500).json({ Success: false, Message: 'Internal Server Error'})
    }

})

router.delete('/:id', (req, res) => {
    const { id } = req.params
    Category.findByIdAndDelete(id)
        .then(category => {
            if(category) return res.json({ Success: true, Message: 'Category succesfully deleted' })
            return res.status(404).json({ Success: false, Message: 'Category not found'})
        })
        .catch(err => {
            console.log(err)
            return res.status(500).json({ Success: false, Message: 'Internal Server Error'})
        })
})


router.put('/:id', (req, res) => {
    const { id } = req.params
    Category.findOneAndUpdate({ id }, req.body)
        .then(result => {
            console.log(result)
            if(result) return res.json(result)
            return res.status(404).json({ Success: false, Message: 'Something went wrong' })
        })
        .catch(err => {
            console.log(err)
            return res.status(500).json({ Success: false, Message: 'Internal Server Error' })
        }) 

})


module.exports = router