const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads/others' 

    if (file.fieldname === 'profile') {
      folder = 'uploads/profiles'
    } else if (file.fieldname === 'product') {
      folder = 'uploads/products'
    } else if (file.fieldname === 'document') {
      folder = 'uploads/documents'
    }

    cb(null, folder)
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${path.basename(file.originalname)}`)
  }
})

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf|docx/
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = allowedTypes.test(file.mimetype)

  if (extname && mimetype) {
    cb(null, true)
  } else {
    cb(new Error('Tipo de archivo no permitido'), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } 
})

module.exports = upload
