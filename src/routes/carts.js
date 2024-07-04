const express = require('express')
const router = express.Router()
const cartController = require('../controllers/cartController')

/**
 * @swagger
 * components:
 *   schemas:
 *     Cart:
 *       type: object
 *       required:
 *         - products
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the cart
 *         products:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *                 description: The id of the product
 *               quantity:
 *                 type: number
 *                 description: The quantity of the product
 *       example:
 *         id: d5fE_asz
 *         products:
 *           - productId: abcd1234
 *             quantity: 2
 */

/**
 * @swagger
 * tags:
 *   name: Carts
 *   description: The carts managing API
 */

/**
 * @swagger
 * /api/carts:
 *   post:
 *     summary: Create a new cart
 *     tags: [Carts]
 *     responses:
 *       201:
 *         description: The cart was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       500:
 *         description: Some server error
 */
router.post('/', cartController.createCart)

/**
 * @swagger
 * /api/carts/{id}:
 *   get:
 *     summary: Get the cart by id
 *     tags: [Carts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The cart id
 *     responses:
 *       200:
 *         description: The cart description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       404:
 *         description: The cart was not found
 */
router.get('/:id', cartController.getCart)

/**
 * @swagger
 * /api/carts/{id}/add:
 *   post:
 *     summary: Add a product to the cart
 *     tags: [Carts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The cart id
 *       - in: body
 *         name: product
 *         description: The product to add
 *         schema:
 *           type: object
 *           required:
 *             - productId
 *             - quantity
 *           properties:
 *             productId:
 *               type: string
 *             quantity:
 *               type: number
 *           example:
 *             productId: abcd1234
 *             quantity: 2
 *     responses:
 *       200:
 *         description: The product was successfully added to the cart
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       404:
 *         description: The cart was not found
 *       500:
 *         description: Some server error
 */
router.post('/:id/add', cartController.addToCart)

/**
 * @swagger
 * /api/carts/{id}/remove:
 *   post:
 *     summary: Remove a product from the cart
 *     tags: [Carts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The cart id
 *       - in: body
 *         name: product
 *         description: The product to remove
 *         schema:
 *           type: object
 *           required:
 *             - productId
 *           properties:
 *             productId:
 *               type: string
 *           example:
 *             productId: abcd1234
 *     responses:
 *       200:
 *         description: The product was successfully removed from the cart
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       404:
 *         description: The cart was not found
 *       500:
 *         description: Some server error
 */
router.post('/:id/remove', cartController.removeFromCart)

module.exports = router