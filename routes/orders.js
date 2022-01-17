const express = require('express')
const res = require('express/lib/response')
const Order = require('../models/order')
const OrderItem = require('../models/orderItem')
const Product = require('../models/product')
const router = express.Router()


router.get('/', async (req, res) => {
    try{
        let orders = await Order.find().populate('user', 'name').sort({'dateOrdered': -1})
        if(!orders) return res.status(500).json({ Success: false, Message: 'Something went wrong' })
        return res.json(orders)
    } catch(err){
        console.log(err)
        return res.status(500).json({ Success: false, Message: 'Something went wrong' })
    }
})

router.get('/:id', async (req, res) => {

    const { id } = req.params

    try{
        let order = await Order.findById(id)
        .populate('user', 'name')
        .populate({ path: 'orderItems', populate: { path: 'product', polulate: 'category' }})
        
        if(!order) return res.status(500).json({ Success: false, Message: 'Something went wrong' })
        return res.json(order)
    } catch(err){
        console.log(err)
        return res.status(500).json({ Success: false, Message: 'Something went wrong' })
    }
})


router.post('/', async (req, res) => {

    const { 
        orderItems,
        shippingAddress1,
        shippingAddress2,
        city,
        zip,
        country,
        phone,
        status,
        totalPrice,
        user
    } = req.body

    const orderItemsIds = await Promise.all(orderItems.map(async orderItem => {
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        })
        newOrderItem = await newOrderItem.save()
        return(newOrderItem._id)
    }))

    const totalPrices = await Promise.all(orderItems.map(i => {
        return new Promise(async (resolve, reject) => {
            try{
                let { price } = await Product.findById(i.product)
                resolve(price * i.quantity)
            } catch(err) {
                console.log(err)
            }
        })
    }))
    
    let order = new Order({
        orderItems: orderItemsIds,
        shippingAddress1,
        shippingAddress2,
        city,
        zip,
        country,
        phone,
        status,
        totalPrice: totalPrices.reduce((a,b) => a + b, 0),
        user
    })
    order = await order.save()
    if(!order) return res.status(400).json({ Success: false, Message: 'The order could not be created' })
    return res.json(order)
})

router.put('/:id', async (req, res) => {
    const { id } = req.params
    const { status } = req.body
    try {
        const updatedOrder = await Order.findOneAndUpdate({ id }, { status })
        if(!updatedOrder) return res.status(400).json({ Success: false, Message: 'Order could not be updated' })
        return res.json(updatedOrder)
    } catch(err) {
        console.log(err)
        return res.status(500).json({ Success: false, Message: 'Internal Server Error' })
    }

})

router.delete('/:id', async (req, res) => {
    const { id } = req.params
    
    try {
        let { orderItems } = await Order.findById(id)
        await Promise.all(orderItems.map(i => OrderItem.findByIdAndDelete(i)))
        const result = await Order.findByIdAndDelete(id)
        if(!result) return res.status(400).json({ Success: false, Message: 'Order could not be deleted' })
        return res.json({ Success: true, Message: 'Order succesfully deleted' })
    } catch(err) {
        console.log(err)
        return res.status(500).json({ Success: false, Message: 'Internal Server Error' })
    }
})

router.get('/total/sales', async (req, res) => {
    try {
        const totalSales = await Order.aggregate([
            { $group: { _id: null, totalSales: { $sum: '$totalPrice' }}}
        ])

        if(!totalSales) return res.status(400).json({ Success: false, Message: 'Something went wrong' })
        return res.json({ totalSales: totalSales.pop().totalSales })
    } catch(err) {
        console.log(err)
        return res.status(500).json({ Success: false, Message: 'Internal Server Error' })
    }
})

router.get('/get/count', async (req, res) => {
    try {
        const orderCount = await Order.countDocuments()
        if(!orderCount) return res.status(400).json({ Success: false, Message: 'Could not generate order count' })
        return res.json({ orderCount })
    } catch(err) {
        console.log(err)
        return res.status(500).json({ Success: false, Message: 'Internal Server Error' })
    }
})

router.get('/get/userOrders/:id', async (req, res) => {
    
    const { id } = req.params

    try {
        const userOrders = await Order.find({ user: id })
                                        .populate({ path:'orderItems', populate:'product'})
                                        .sort({ 'dateOrdered': -1 })
        if(!userOrders) return res.status(400).json({ Success: false, Message: 'Could not find orders for the specified user' })
        return res.json(userOrders)
    } catch(err) {
        console.log(err)
        return res.status(500).json({ Success: false, Message: 'Internal Server Error' })
    }
})


module.exports = router