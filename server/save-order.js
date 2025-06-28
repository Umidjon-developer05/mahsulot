// Node.js server uchun - real JSON faylga saqlash
const fs = require('fs').promises
const path = require('path')
const express = require('express')
const app = express()

async function saveOrderToJSON(orderData) {
	try {
		const filePath = path.join(__dirname, '../data/orders.json')

		// Mavjud ma'lumotlarni o'qish
		let ordersData
		try {
			const fileContent = await fs.readFile(filePath, 'utf8')
			ordersData = JSON.parse(fileContent)
		} catch (error) {
			// Fayl mavjud bo'lmasa, yangi struktura yaratish
			ordersData = {
				orders: [],
				lastUpdated: new Date().toISOString(),
				metadata: {
					version: '1.0',
					description: 'TechStore buyurtmalari',
					totalOrders: 0,
				},
			}
		}

		// Telefon raqami asosida unique ID yaratish
		const phoneId = orderData.customerPhone.replace(/[^0-9]/g, '')
		const timestamp = Date.now()
		const uniqueId = `${phoneId}_${timestamp}`

		// Yangi buyurtma yaratish
		const newOrder = {
			id: uniqueId,
			orderId: timestamp,
			phoneId: phoneId,
			...orderData,
			status: 'new',
			orderDate: new Date().toISOString(),
		}

		// Buyurtmani qo'shish
		ordersData.orders.unshift(newOrder)
		ordersData.lastUpdated = new Date().toISOString()
		ordersData.metadata.totalOrders = ordersData.orders.length

		// Faylga yozish
		await fs.writeFile(filePath, JSON.stringify(ordersData, null, 2), 'utf8')

		console.log('Buyurtma muvaffaqiyatli saqlandi:', newOrder.id)
		return newOrder
	} catch (error) {
		console.error('Buyurtmani saqlashda xatolik:', error)
		throw error
	}
}

// Express.js endpoint
app.post('/api/orders', async (req, res) => {
	try {
		const newOrder = await saveOrderToJSON(req.body)
		res.json({ success: true, order: newOrder })
	} catch (error) {
		res.status(500).json({ success: false, error: error.message })
	}
})

module.exports = { app, saveOrderToJSON }
