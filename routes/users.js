const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const router = express.Router()


router.get('/get/count', async (req, res) => {
    try {  
        let userCount = await User.countDocuments()
        if(!userCount) return res.status(500).json({ Success: false, Message: 'Something went wrong' })
        return res.json({ userCount })
    } catch(err){
        console.log(err)
        return res.status(500).json({ Success: false, Message: 'Internal Server Error' })
    }
})

router.post('/register', async (req, res) => {
    const { name, email, password, phone, isAdmin, apartment, zip, city, country } = req.body
    
    try {   
        let user = new User({ name, email, passwordHash: bcrypt.hashSync(password, 10), phone, isAdmin, apartment, zip, city, country })
        const result = await user.save()
        if(result) return res.json(result)
        return res.status(500).json({ Success: false, Message: 'Something went wrong' })
    } catch(err){
        console.log(err)
        return res.status(500).json({ Success: false, Message: 'Something went wrong' })
    }
})

router.post('/login', async (req, res) => {
    const { email, password } = req.body
    // check if user exists
    try {
        let user = await User.findOne({ email })
        if(!user) return res.status(400).json({ Success: false, Message: 'User not found' })
        
        // check if password is valid
        let checkUser = await bcrypt.compare(password, user.passwordHash)
        if(!checkUser) return res.status(400).json({ Success: false, Message: 'Invalid credentials' })
    
        // password is valid...create token
        const token = jwt.sign({ userId: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '1d' })
        return res.json({ token })
    } catch(err) {
        console.log(err)
        return res.status(500).json({ Success: false, Message: 'Internal Server Error' })
    } 
})


router.get('/', async (req, res) => {
    try{
        const users = await User.find().select('-passwordHash')
        if(!users) return res.status(500).json({ Success: false, Message: 'Something went wrong' })
        return res.json(users)
    } catch(err) {
        console.log(err)
        return res.status(500).json({ Success: false, Message: 'Something went wrong' })
    }
})

router.get('/:id', async (req, res) => {
    
    const { id } = req.params

    try{
        const user = await User.findById(id).select('-passwordHash')
        if(!user) return res.status(500).json({ Success: false, Message: 'Something went wrong' })
        return res.json(user)
    } catch(err) {
        console.log(err)
        return res.status(500).json({ Success: false, Message: 'Something went wrong' })
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params
        let result = await User.findByIdAndDelete(id)
        if(!result) return res.status(500).json({ Success: false, Message: 'Something went wrong' })
        return res.json({ Success: true, Message: 'User succesfully deleted' })
    } catch(err) {
        console.log(err)
        return res.status(500).json({ Success: false, Message: 'Internal Server Error' })
    }
})




module.exports = router