const express = require('express')
const app = express()
const cors = require('cors')
const morgan = require('morgan')
const mongoose = require('mongoose')
require('dotenv').config()

// Routes
const productsRoutes = require('./routes/products.js')
const ordersRoutes = require('./routes/orders.js')
const categoriesRoutes = require('./routes/categories.js')
const userRoutes = require('./routes/users.js')


// API URL
const api = process.env.API_URL

// Middleware
app.use(cors())
app.options('*', cors())
app.use(morgan('tiny'))
app.use(express.json())
//app.use(authJwt())
app.use('/public/uploads', express.static(__dirname + '/public/uploads'))

// Routes
app.use(`${api}/products`, productsRoutes )
app.use(`${api}/orders`, ordersRoutes)
app.use(`${api}/categories`, categoriesRoutes)
app.use(`${api}/users`, userRoutes)

app.get('/', (req, res) => {
    res.send('Hi')
})

// DB connection
mongoose.connect(process.env.DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Database connected.')
})
.catch(err => console.log(err))

/** 
 *  
 * Development
 * app.listen(3000, () => {
 *  console.log(`Server listening on port ${port}`)
 * })
*/ 

// Production
var server = app.listen(process.env.PORT || 3000, () => {
    var port = server.address().port
    console.log(`Express is working on port ${port}`)
})