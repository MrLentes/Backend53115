const User = require('../dao/Models/User')
const bcrypt = require('bcrypt')

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
        res.json(users)
    } catch (error) {
        console.error('Error getting users:', error)
        res.status(500).send('Server error')
    }
}

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) {
            return res.status(404).send('User not found')
        }
        res.json(user)
    } catch (error) {
        console.error('Error getting user:', error)
        res.status(500).send('Server error')
    }
}

exports.createUser = async (req, res) => {
    try {
        const { first_name, last_name, email, age, password, cart } = req.body
        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = new User({
            first_name,
            last_name,
            email,
            age,
            password: hashedPassword,
            cart
        })
        await newUser.save()
        res.status(201).json(newUser)
    } catch (error) {
        console.error('Error creating user:', error)
        res.status(500).send('Server error')
    }
}

exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true })
        if (!user) {
            return res.status(404).send('User not found')
        }
        res.json(user)
    } catch (error) {
        console.error('Error updating user:', error)
        res.status(500).send('Server error')
    }
}

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id)
        if (!user) {
            return res.status(404).send('User not found')
        }
        res.send('User deleted')
    } catch (error) {
        console.error('Error deleting user:', error)
        res.status(500).send('Server error')
    }
}