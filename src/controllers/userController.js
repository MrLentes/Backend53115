const crypto = require('crypto')
const logger = require('../config/logger')
const User = require('../dao/Models/User')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'CorreoAdmin@gmail.com',
        pass: '1234'
    }
})

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
        res.json(users)
    } catch (error) {
        logger.error('Error getting users:', error)
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
        logger.error('Error getting user:', error)
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
        logger.error('Error creating user:', error)
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
        logger.error('Error updating user:', error)
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
        logger.error('Error deleting user:', error)
        res.status(500).send('Server error')
    }
}

exports.forgotPassword = async (req, res) => {
    try {
        const {email} = req.body
        const user = await User.findOne({email})

        if (!user) {
            return res.status(400).send('Usuario no enconmtrado')
        }

        const token = crypto.randomBytes(15).toString('hex')
        user.resetPasswordToken = token
        user.resetPasswordExpires = Date.now() + 3600000
        await user.save()

        const resetUrl = `http://${req.headers.host}/reset/${token}`

        const mailOptions = {
            to: user.email,
            from : 'CorreoAdmin@gmail.com',
            subject: 'Restablecimiento de contraseña',
            text: `Recibiste este correo porque tú (o alguien más) solicitó restablecer la contraseña de tu cuenta.\n\n` +
            `Por favor haz clic en el siguiente enlace o copia y pega esta URL en tu navegador para completar el proceso dentro de una hora:\n\n` +
            `${resetUrl}\n\n` +
            `Si no solicitaste esto, por favor ignora este correo y tu contraseña permanecerá sin cambios.\n`
        }

        transporter.sendMail(mailOptions, (err) => {
            if (err) {
                return res.status(500).send('Error al enviar el correo')
            }
            res.status(200).send('Correo de restablecimiento enviado')
        })
    } catch (error) {
    res.status(500).send('Error del servidor')
    }
}

exports.resetPassword = async (req, res) => {
    try {
      const { token } = req.params
      const { password } = req.body
  
      const user = await User.findOne({ 
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      })
  
      if (!user) {
        return res.status(400).send('El token de restablecimiento de contraseña es inválido o ha expirado.')
      }
  
      if (await bcrypt.compare(password, user.password)) {
        return res.status(400).send('No puedes usar la misma contraseña anterior.')
      }
  
      user.password = await bcrypt.hash(password, 10)
      user.resetPasswordToken = undefined
      user.resetPasswordExpires = undefined
      await user.save()
  
      res.status(200).send('Contraseña restablecida exitosamente')
    } catch (error) {
      res.status(500).send('Error del servidor')
    }
  }