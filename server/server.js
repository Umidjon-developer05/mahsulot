const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const path = require('path')
const fs = require('fs-extra')

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
// CORS konfiguratsiyasini yangilash
app.use(
	cors({
		origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
		credentials: true,
	})
)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Static files - HTML fayllarni serve qilish (admin.html uchun)
app.use(express.static(path.join(__dirname, '..')))
app.use('/admin', express.static(path.join(__dirname, '..')))

// Orders JSON fayl yo'li
const ORDERS_FILE = path.join(__dirname, '../data/orders.json')

// Orders faylini tekshirish va yaratish
async function ensureOrdersFile() {
	try {
		await fs.ensureFile(ORDERS_FILE)
		const stats = await fs.stat(ORDERS_FILE)

		if (stats.size === 0) {
			const initialData = {
				orders: [],
				lastUpdated: new Date().toISOString(),
				metadata: {
					version: '1.0',
					description: 'TechStore buyurtmalari',
					totalOrders: 0,
					fields: {
						id: 'Telefon raqami + timestamp asosida unique ID',
						orderId: "Ko'rsatish uchun raqamli ID",
						phoneId: 'Tozalangan telefon raqami',
						customerName: 'Mijoz ismi',
						customerPhone: 'Telefon raqami',
						address: 'Manzil',
						products: 'Buyurtma qilingan mahsulotlar',
						totalAmount: 'Jami summa',
						status: 'Buyurtma holati',
						orderDate: 'Buyurtma sanasi',
					},
				},
			}
			await fs.writeJson(ORDERS_FILE, initialData, { spaces: 2 })
			console.log('📁 Orders.json fayli yaratildi')
		}
	} catch (error) {
		console.error('❌ Orders faylini yaratishda xatolik:', error)
	}
}

// Buyurtmalarni yuklash
async function loadOrders() {
	try {
		const data = await fs.readJson(ORDERS_FILE)
		return data
	} catch (error) {
		console.error('❌ Buyurtmalarni yuklashda xatolik:', error)
		return {
			orders: [],
			lastUpdated: new Date().toISOString(),
			metadata: { totalOrders: 0 },
		}
	}
}

// Buyurtmalarni saqlash
async function saveOrders(ordersData) {
	try {
		await fs.writeJson(ORDERS_FILE, ordersData, { spaces: 2 })
		console.log('✅ Buyurtmalar saqlandi:', ordersData.orders.length, 'ta')
		return true
	} catch (error) {
		console.error('❌ Buyurtmalarni saqlashda xatolik:', error)
		return false
	}
}

// API Routes

// Barcha buyurtmalarni olish - debug bilan
app.get('/api/orders', async (req, res) => {
	try {
		console.log('📡 API Request: GET /api/orders')
		const ordersData = await loadOrders()
		console.log('📊 Orders found:', ordersData.orders.length)

		res.json({
			success: true,
			data: ordersData,
			debug: {
				ordersCount: ordersData.orders.length,
				filePath: ORDERS_FILE,
				timestamp: new Date().toISOString(),
			},
		})
	} catch (error) {
		console.error('❌ API Error:', error)
		res.status(500).json({
			success: false,
			error: error.message,
		})
	}
})

// Yangi buyurtma qo'shish
app.post('/api/orders', async (req, res) => {
	try {
		const orderData = req.body

		// Telefon raqami asosida unique ID yaratish
		const phoneId = orderData.customerPhone.replace(/[^0-9]/g, '')
		const timestamp = Date.now()
		const uniqueId = `${phoneId}_${timestamp}`

		// Yangi buyurtma obyekti
		const newOrder = {
			id: uniqueId,
			orderId: timestamp,
			phoneId: phoneId,
			...orderData,
			status: 'new',
			orderDate: new Date().toISOString(),
		}

		// Mavjud buyurtmalarni yuklash
		const ordersData = await loadOrders()

		// Yangi buyurtmani qo'shish
		ordersData.orders.unshift(newOrder)
		ordersData.lastUpdated = new Date().toISOString()
		ordersData.metadata.totalOrders = ordersData.orders.length

		// Saqlash
		const saved = await saveOrders(ordersData)

		if (saved) {
			console.log("📦 Yangi buyurtma qo'shildi:", newOrder.id)
			res.json({
				success: true,
				data: newOrder,
				message: "Buyurtma muvaffaqiyatli qo'shildi",
			})
		} else {
			throw new Error('Buyurtmani saqlashda xatolik')
		}
	} catch (error) {
		console.error("❌ Buyurtma qo'shishda xatolik:", error)
		res.status(500).json({
			success: false,
			error: error.message,
		})
	}
})

// Buyurtma holatini yangilash
app.put('/api/orders/:id', async (req, res) => {
	try {
		const orderId = req.params.id
		const { status } = req.body

		const ordersData = await loadOrders()
		const orderIndex = ordersData.orders.findIndex(
			order => order.id === orderId
		)

		if (orderIndex === -1) {
			return res.status(404).json({
				success: false,
				error: 'Buyurtma topilmadi',
			})
		}

		ordersData.orders[orderIndex].status = status
		ordersData.orders[orderIndex].updatedAt = new Date().toISOString()
		ordersData.lastUpdated = new Date().toISOString()

		const saved = await saveOrders(ordersData)

		if (saved) {
			res.json({
				success: true,
				data: ordersData.orders[orderIndex],
				message: 'Buyurtma holati yangilandi',
			})
		} else {
			throw new Error('Buyurtmani yangilashda xatolik')
		}
	} catch (error) {
		res.status(500).json({
			success: false,
			error: error.message,
		})
	}
})

// Buyurtmani o'chirish
app.delete('/api/orders/:id', async (req, res) => {
	try {
		const orderId = req.params.id

		const ordersData = await loadOrders()
		const initialLength = ordersData.orders.length

		ordersData.orders = ordersData.orders.filter(order => order.id !== orderId)

		if (ordersData.orders.length === initialLength) {
			return res.status(404).json({
				success: false,
				error: 'Buyurtma topilmadi',
			})
		}

		ordersData.lastUpdated = new Date().toISOString()
		ordersData.metadata.totalOrders = ordersData.orders.length

		const saved = await saveOrders(ordersData)

		if (saved) {
			res.json({
				success: true,
				message: "Buyurtma o'chirildi",
			})
		} else {
			throw new Error("Buyurtmani o'chirishda xatolik")
		}
	} catch (error) {
		res.status(500).json({
			success: false,
			error: error.message,
		})
	}
})

// Statistika
app.get('/api/stats', async (req, res) => {
	try {
		const ordersData = await loadOrders()
		const orders = ordersData.orders

		const stats = {
			totalOrders: orders.length,
			newOrders: orders.filter(o => o.status === 'new').length,
			processingOrders: orders.filter(o => o.status === 'processing').length,
			completedOrders: orders.filter(o => o.status === 'completed').length,
			cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
			totalRevenue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
			uniqueCustomers: new Set(orders.map(o => o.customerPhone)).size,
			lastUpdated: ordersData.lastUpdated,
		}

		res.json({
			success: true,
			data: stats,
		})
	} catch (error) {
		res.status(500).json({
			success: false,
			error: error.message,
		})
	}
})

// Root route - index.html ga yo'naltirish
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '../index.html'))
})

// Admin panel route
app.get('/admin', (req, res) => {
	res.sendFile(path.join(__dirname, '../admin.html'))
})

// Admin.js file serve qilish
app.get('/admin.js', (req, res) => {
	res.sendFile(path.join(__dirname, '../admin.js'))
})

// Server ishga tushirish
async function startServer() {
	try {
		await ensureOrdersFile()

		app.listen(PORT, () => {
			console.log('🚀 TechStore Server ishga tushdi!')
			console.log(`📍 Server manzili: http://localhost:${PORT}`)
			console.log(`🏪 Asosiy do'kon: http://localhost:${PORT}`)
			console.log(`⚙️  Admin panel: http://localhost:${PORT}/admin`)
			console.log(`📊 API: http://localhost:${PORT}/api/orders`)
			console.log('📁 Orders fayli:', ORDERS_FILE)
		})
	} catch (error) {
		console.error('❌ Serverni ishga tushirishda xatolik:', error)
	}
}

startServer()
