const passport = require('passport')
const bcrypt = require('bcrypt')
const User = require('../dao/Models/User')

exports.register = async (req, res) => {
  try {
    const { first_name, last_name, email, age, password, cart } = req.body
    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = await User.create({ first_name, last_name, email, age, password: hashedPassword, cart })
    res.send('Usuario registrado correctamente')
  } catch (error) {
    console.error('Error al registrar usuario:', error)
    res.status(500).send('Error del servidor')
  }
}

exports.login = passport.authenticate('local', {
  successRedirect: '/products',
  failureRedirect: '/login',
  failureFlash: true
})

exports.logout = (req, res) => {
  req.logout()
  res.redirect('/login')
}

exports.github = passport.authenticate('github')

exports.githubCallback = passport.authenticate('github', {
  failureRedirect: '/login',
  successRedirect: '/products'
})