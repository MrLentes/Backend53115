const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const upload = require('../middlewares/upload')

router.get('/', userController.getAllUsers)
router.get('/:id', userController.getUserById)
router.post('/', userController.createUser)
router.put('/:id', userController.updateUser)
router.delete('/:id', userController.deleteUser)
router.post('/forgot-password', userController.forgotPassword)
router.post('/reset/:token', userController.resetPassword)
router.post('/premium/:uid', userController.changeUserRoleToPremium)
router.post('/:uid/documents', upload.array('documents'), userController.uploadDocuments)
router.get('/admin/users', userController.vistaDeUsuarios)

module.exports = router