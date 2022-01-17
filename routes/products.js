const express = require('express')
const multer = require('multer')
const mongoose = require('mongoose')
const router = express.Router()
const Product = require('../models/product.js')
const Category = require('../models/category.js')
const { Mongoose } = require('mongoose')
require('dotenv').config()

const FILE_TYPE_MAP = {
    'image/png':'png',
    'image/jpeg':'jpeg',
    'image/jpg':'jpg'
}

const storage = multer.diskStorage({
    // control of destination
    destination: function(req, file, callback){
        const isValid = FILE_TYPE_MAP[file.mimetype]
        let uploadError = new Error('invalid image type')
        if(isValid) {
            uploadError = null
        }
        // callback will be returned if there is an error in uploading and we assign a destination to it
        callback(uploadError, 'public/uploads')
    },
    // control of filename
    filename: function(req, file, cb){
        const filename = file.originalname.replace(' ', '-')
        const extension = FILE_TYPE_MAP[file.mimetype]
        cb(null, `${filename}-${Date.now()}.${extension}`)
    }
})

const uploadOptions = multer({ storage })

// API URL
const api = process.env.API_URL

router.get('/get/count', async (req, res) => {
    try {
        const productCount = await Product.countDocuments()
        if(!productCount) return res.status(500).json({ Success: false, Message: 'Something went wrong' })
        return res.json({ productCount })
    } catch(err) {
        console.log(err)
        return res.status(500).json({ Success: true, Message: 'Internal Server Error' })
    }
})

router.get('/get/featured', async (req, res) => {

    const count = req.query.count ? req.query.count : 5
    console.log(count)

    try {
        const products = await Product.find({ isFeatured: true }).limit(count)
        if(products) return res.json(products)
        return res.status(400).json({ Success: false, Message: 'Something went wrong' })
    } catch(err) {
        console.log(err)
        return res.status(500).json({ Success: true, Message: 'Internal Server Error' })
    }
})


router.get('/', (req, res) =>{

    let filter = {}
    if(req.query.categories){
        filter = { category: req.query.categories.split(',') }
    }

    Product.find(filter).populate('category')
        .then(data => res.json(data))
        .catch(err => res.status(500).json({ error: err, success: false }))
})

router.get('/:id', async (req, res) => {
    const { id } = req.params

    try {
        const product = await Product.findById(id).populate('category')
        if(product) return res.json(product)
        return res.status(400).json({ Success: false, Message: 'Product not found' })
    } catch(err) {
        console.log(err)
        return res.status(500).json({ Success: false, Message: 'Internal Server Error' })
    }
})

router.post('/', uploadOptions.single('image'), async (req, res) => {

    const file = req.file

    // checking file
    if(!file) return res.status(400).json({ Success: false, Message: 'No image in the request' })

    const filename = req.file.filename
    const basePath = `${req.protocol}://${req.get('host')}/public/upload/`

    const { name, 
            description, 
            richDescription, 
            brand, 
            price, 
            category, 
            countInStock, 
            rating, 
            numReviews, 
            isFeatured 
        } = req.body

    try{
        // checking category
        const isCategory = await Category.findById(category)
        if(!isCategory) return res.status(404).json({ Success: false, Message: 'Wrong category' })

        // checking file
        if(!file) return res.status(400).json({ Success: false, Message: 'No image in the request' })

        // saving product
        const product = new Product({
            name,
            description,
            richDescription,
            image: `${basePath}${filename}`,
            brand,
            price,
            category,
            countInStock,
            rating,
            numReviews,
            isFeatured
        })
    
        const isProduct = await product.save()
        if(!isProduct) return res.status(400).json({ Success: false, Message: 'Product could not be saved' })
        return res.json(isProduct)
    } catch(err){
        console.log(err)
        return res.status(500).json({ Success: false, Message: 'Internal server error' })
    }
})


router.put('/:id', uploadOptions.single('image'), async (req, res) => {
    const { 
        name,
        description,
        richDescription,
        image,
        brand,
        price,
        category,
        countInStock,
        rating,
        numReviews,
        isFeatured
    } = req.body

    const { id } = req.params

    try {
        const product = await Product.findById(id)
        if(!product) return res.status(400).json({ Success: false, Message: 'Product not found' })
        
        const file = req.file
        let imagePath
        if(file){
            const filename = file.filename
            const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
            imagePath = `${basePath}${filename}`
        } else {
            imagePath = product.image
        }

        const updatedProduct = await Product.findOneAndUpdate({ id }, {
            name,
            description,
            richDescription,
            image: imagePath,
            brand,
            price,
            category,
            countInStock,
            rating,
            numReviews,
            isFeatured
        }, { new: true })
        
        if(!updatedProduct) return res.status(400).json({ Success: false, Message: 'Product not updated' })
        return res.json(updatedProduct)

    } catch(err) {
        console.log(err)
        return res.status(500).json({ Success: false, Message: 'Internal Server Error' })
    }
})

router.put('/gallery-images/:id', uploadOptions.array('images', 10), async (req, res) => {
    const { id } = req.params

    if(!mongoose.isValidObjectId(id)) return res.status(400).json({ Success: false, Message: 'Invalid Product Id' })

    const files = req.files
    let imagesPaths = []
    if(files){
        imagesPaths = files.map(file => {
            let basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
            let filename = file.filename
            return `${basePath}${filename}`
        })    
    }
    
    try {
        const product = await Product.findOneAndUpdate({ id }, {
            images: imagesPaths
        }, { new: true })
    
        if(!product) return res.status(400).json({ Succees: false, Message: 'Product not found' })
        return res.json(product)

    } catch(err) {
        console.log(err)
        return res.status(500).json({ Success: false, Message: 'Internal Server Error' })
    }
})

router.delete('/:id', async (req, res) => {
    const { id } = req.params
    try {
        const result = await Product.findByIdAndDelete(id)
        if(result) return res.json({ Success: true, Message: 'Product succesfully deleted' })
        return res.status(400).json({ Success: false, Message: 'Something went wrong' })
    } catch(err) {
        console.log(err)
        return res.status(500).json({ Success: false, Message: 'Internal Server Error' })
    }
})


module.exports = router