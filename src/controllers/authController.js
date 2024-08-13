const passport = require('passport')
const bcrypt = require('bcrypt')
const User = require('../dao/Models/User')
const logger = require('../config/logger')

exports.register = async (req, res) => {
  try {
    const { first_name, last_name, email, age, password, cart } = req.body
    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = await User.create({ first_name, last_name, email, age, password: hashedPassword, cart })
    res.send('Usuario registrado correctamente')
  } catch (error) {
    logger.error('Error al registrar usuario:', error)
    res.status(500).send('Error del servidor')
  }
}

exports.login = async (req, res, next) => {
  passport.authenticate('local', async (err, user, info) => {
    if (err) return next(err)
    if (!user) return res.redirect('/login')

    user.last_connection = new Date()
    await user.save()

    req.logIn(user, (err) => {
      if (err) return next(err)
      res.redirect('/products')
    })
  })(req, res, next)
}

exports.logout = async (req, res) => {
  try {
    const user = req.user
    if (user) {
      user.last_connection = new Date()
      await user.save()
    }

    req.logout(() => {
      res.redirect('/login')
    })
  } catch (error) {
    logger.error('Error during logout:', error)
    res.status(500).send('Error del servidor')
  }
}

exports.github = passport.authenticate('github')

exports.githubCallback = passport.authenticate('github', {
  failureRedirect: '/login',
  successRedirect: '/products'
})