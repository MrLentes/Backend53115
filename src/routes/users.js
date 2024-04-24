const express = require('express')
const router = express.Router()
const User = require('../models/User')

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const newUser = new User({ username, email, password })
    await newUser.save();
    res.status(201).send('Usuario registrado correctamente')
  } catch (error) {
    console.error('Error al registrar usuario:', error)
    res.status(500).send('Error del servidor')
  }
})

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    const user = await User.findOne({ username })
    if (!user) {
      return res.status(404).send('Usuario no encontrado')
    }
    if (user.password !== password) {
      return res.status(401).send('Contraseña incorrecta')
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send('Contraseña incorrecta');
    }
    req.session.userId = user._id
    res.status(200).send('Inicio de sesión exitoso')
  } catch (error) {
    console.error('Error al iniciar sesión:', error)
    res.status(500).send('Error del servidor')
  }
})

module.exports = router