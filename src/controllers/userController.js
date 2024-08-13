const crypto = require('crypto')
const logger = require('../config/logger')
const User = require('../dao/Models/User')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const moment = require('moment')

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'CorreoAdmin@gmail.com',
        pass: '1234'
    }
})

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, 'first_name last_name email role')
        res.json(users)
    } catch (error) {
        logger.error('Error al obtener los usuarios:', error)
        res.status(500).send('Error del servidor')
    }
}

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) {
            return res.status(404).send('Usuario no encontrado')
        }
        res.json(user)
    } catch (error) {
        logger.error('Error al obtener al usuario:', error)
        res.status(500).send('Error del servidor')
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
        logger.error('Error creando el usuario:', error)
        res.status(500).send('Error del servidor')
    }
}

exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true })
        if (!user) {
            return res.status(404).send('Usuario no encontrado')
        }
        res.json(user)
    } catch (error) {
        logger.error('Error actualizando el usuario:', error)
        res.status(500).send('Error del servidor')
    }
}

exports.deleteUser = async (req, res) => {
    try {
        const twoDaysAgo = moment().subtract(2, 'days').toDate()
        const usersToDelete = await User.find({ last_connection: { $lt: twoDaysAgo } })

        for (let user of usersToDelete) {
          await User.findByIdAndDelete(user._id)
          await transporter.sendMail({
            from: 'your-email@example.com',
            to: user.email,
            subject: 'Cuenta eliminada por inactividad',
            text: `Hola ${user.first_name}, tu cuenta ha sido eliminada debido a la inactividad.`,
          });
        }

        res.json({ message: 'Usuarios eliminados por inactividad' });
    } catch (error) {
      logger.error('Error al eliminar usuarios inactivos:', error);
      res.status(500).json({ message: 'Error al eliminar usuarios inactivos' });
    }
  }

exports.forgotPassword = async (req, res) => {
    try {
        const {email} = req.body
        const user = await User.findOne({email})

        if (!user) {
            return res.status(400).send('Usuario no encontrado')
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

exports.changeUserRoleToPremium = async (req, res) => {
      try {
        const userId = req.params.uid
        const user = await User.findById(userId)
  
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' })
        }

        const requiredDocuments = ['Identificación', 'Comprobante de domicilio', 'Comprobante de estado de cuenta']
        const userDocuments = user.documents.map(doc => doc.name)

        const hasAllDocuments = requiredDocuments.every(doc => userDocuments.includes(doc))

        if (!hasAllRequiredDocuments) {
            return res.status(400).json({ message: 'El usuario no ha terminado de procesar su documentación' });
        }

        if (user.role === 'premium') {
            user.role = 'user';
        } else {
            user.role = 'premium';
        }
        await user.save()

        res.status(200).json({ message: 'El rol del usuario ha sido actualizado a premium' })
    } catch (error) {
        console.error('Error al cambiar el rol del usuario:', error)
        res.status(500).json({ message: 'Error del servidor' })
    }
}
  
exports.uploadDocuments = async (req, res) => {
    try {
      const userId = req.params.uid
      const documents = req.files.map(file => ({
        name: file.originalname,
        reference: file.path
      }))
  
      const user = await User.findById(userId)
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' })
      }
  
      user.documents = [...user.documents, ...documents]
      await user.save()
  
      res.status(200).json({ message: 'Documentos subidos exitosamente', documents })
    } catch (error) {
      console.error('Error al subir documentos:', error)
      res.status(500).json({ message: 'Error del servidor' })
    }
}

exports.vistaDeUsuarios = async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).send('Acceso denegado')
    }
    try {
        const users = await User.find({})
        res.render('adminUsers', { users })
    } catch (error) {
        res.status(500).json({ message: 'Error al cargar la vista de usuarios' })
    }
}