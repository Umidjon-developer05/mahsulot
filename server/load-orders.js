// JSON fayldan buyurtmalarni o'qish
const fs = require('fs').promises
const path = require('path')
const express = require('express')
const app = express()

async function loadOrdersFromJSON() {
	try {
		const filePath = path.join(__dirname, '../data/orders.json')
		const fileContent = await fs.readFile(filePath, 'utf8')
		const ordersData = JSON.parse(fileContent)

		return ordersData
	} catch (error) {
		console.error('Buyurtmalarni yuklashda xatolik:', error)
		return {
			orders: [],
			lastUpdated: new Date().toISOString(),
			metadata: { totalOrders: 0 },
		}
	}
}

// Express.js endpoint
app.get('/api/orders', async (req, res) => {
	try {
		const ordersData = await loadOrdersFromJSON()
		res.json(ordersData)
	} catch (error) {
		res.status(500).json({ success: false, error: error.message })
	}
})

module.exports = { app, loadOrdersFromJSON }
