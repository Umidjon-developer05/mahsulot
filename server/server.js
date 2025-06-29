const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const path = require('path')
const fs = require('fs-extra')

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(
	cors({
		origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
		credentials: true,
	})
)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Static files
app.use(express.static(path.join(__dirname, '..')))
app.use('/admin', express.static(path.join(__dirname, './admin')))

// File paths
const ORDERS_FILE = path.join(__dirname, './data/orders.json')
const PRODUCTS_FILE = path.join(__dirname, './data/products.json')

// Ensure files exist
async function ensureDataFiles() {
	try {
		// Orders file
		await fs.ensureFile(ORDERS_FILE)
		const ordersStats = await fs.stat(ORDERS_FILE)
		if (ordersStats.size === 0) {
			const initialOrdersData = {
				orders: [],
				lastUpdated: new Date().toISOString(),
				metadata: {
					version: '1.0',
					description: 'TechStore buyurtmalari',
					totalOrders: 0,
				},
			}
			await fs.writeJson(ORDERS_FILE, initialOrdersData, { spaces: 2 })
			console.log('📁 Orders.json fayli yaratildi')
		}

		// Products file
		await fs.ensureFile(PRODUCTS_FILE)
		const productsStats = await fs.stat(PRODUCTS_FILE)
		if (productsStats.size === 0) {
			const initialProductsData = {
				products: [],
				categories: [
					{ id: 'telefon', name: 'Telefonlar', icon: '📱' },
					{ id: 'kompyuter', name: 'Kompyuterlar', icon: '💻' },
					{ id: 'audio', name: 'Audio', icon: '🎧' },
					{ id: 'planshet', name: 'Planshetlar', icon: '📱' },
					{ id: 'kamera', name: 'Kameralar', icon: '📷' },
					{ id: 'soat', name: 'Smart soatlar', icon: '⌚' },
				],
				lastUpdated: new Date().toISOString(),
				metadata: {
					version: '1.0',
					description: 'TechStore mahsulotlari',
					totalProducts: 0,
				},
			}
			await fs.writeJson(PRODUCTS_FILE, initialProductsData, { spaces: 2 })
			console.log('📁 Products.json fayli yaratildi')
		}
	} catch (error) {
		console.error('❌ Data fayllarini yaratishda xatolik:', error)
	}
}

// Load data functions
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

async function loadProducts() {
	try {
		const data = await fs.readJson(PRODUCTS_FILE)
		return data
	} catch (error) {
		console.error('❌ Mahsulotlarni yuklashda xatolik:', error)
		return {
			products: [],
			categories: [],
			lastUpdated: new Date().toISOString(),
			metadata: { totalProducts: 0 },
		}
	}
}

async function saveProducts(productsData) {
	try {
		await fs.writeJson(PRODUCTS_FILE, productsData, { spaces: 2 })
		console.log('✅ Mahsulotlar saqlandi:', productsData.products.length, 'ta')
		return true
	} catch (error) {
		console.error('❌ Mahsulotlarni saqlashda xatolik:', error)
		return false
	}
}

// ORDERS API ROUTES

// Get all orders
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

// Create new order
app.post('/api/orders', async (req, res) => {
	try {
		const orderData = req.body

		const phoneId = orderData.customerPhone.replace(/[^0-9]/g, '')
		const timestamp = Date.now()
		const uniqueId = `${phoneId}_${timestamp}`

		const newOrder = {
			id: uniqueId,
			orderId: timestamp,
			phoneId: phoneId,
			...orderData,
			status: 'new',
			orderDate: new Date().toISOString(),
		}

		const ordersData = await loadOrders()
		ordersData.orders.unshift(newOrder)
		ordersData.lastUpdated = new Date().toISOString()
		ordersData.metadata.totalOrders = ordersData.orders.length

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

// Update order status
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

// Delete order
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

// PRODUCTS API ROUTES

// Get all products
app.get('/api/products', async (req, res) => {
	try {
		console.log('📡 API Request: GET /api/products')
		const productsData = await loadProducts()
		console.log('📊 Products found:', productsData.products.length)

		res.json({
			success: true,
			data: productsData,
			debug: {
				productsCount: productsData.products.length,
				filePath: PRODUCTS_FILE,
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

// Create new product
app.post('/api/products', async (req, res) => {
	try {
		const productData = req.body

		const productsData = await loadProducts()

		// Generate new ID
		const maxId =
			productsData.products.length > 0
				? Math.max(...productsData.products.map(p => p.id))
				: 0
		const newId = maxId + 1

		const newProduct = {
			id: newId,
			...productData,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		}

		productsData.products.push(newProduct)
		productsData.lastUpdated = new Date().toISOString()
		productsData.metadata.totalProducts = productsData.products.length

		const saved = await saveProducts(productsData)

		if (saved) {
			console.log("📦 Yangi mahsulot qo'shildi:", newProduct.id)
			res.json({
				success: true,
				data: newProduct,
				message: "Mahsulot muvaffaqiyatli qo'shildi",
			})
		} else {
			throw new Error('Mahsulotni saqlashda xatolik')
		}
	} catch (error) {
		console.error("❌ Mahsulot qo'shishda xatolik:", error)
		res.status(500).json({
			success: false,
			error: error.message,
		})
	}
})

// Update product
app.put('/api/products/:id', async (req, res) => {
	try {
		const productId = parseInt(req.params.id)
		const updateData = req.body

		const productsData = await loadProducts()
		const productIndex = productsData.products.findIndex(
			product => product.id === productId
		)

		if (productIndex === -1) {
			return res.status(404).json({
				success: false,
				error: 'Mahsulot topilmadi',
			})
		}

		productsData.products[productIndex] = {
			...productsData.products[productIndex],
			...updateData,
			updatedAt: new Date().toISOString(),
		}
		productsData.lastUpdated = new Date().toISOString()

		const saved = await saveProducts(productsData)

		if (saved) {
			res.json({
				success: true,
				data: productsData.products[productIndex],
				message: 'Mahsulot yangilandi',
			})
		} else {
			throw new Error('Mahsulotni yangilashda xatolik')
		}
	} catch (error) {
		res.status(500).json({
			success: false,
			error: error.message,
		})
	}
})

// Delete product
app.delete('/api/products/:id', async (req, res) => {
	try {
		const productId = parseInt(req.params.id)

		const productsData = await loadProducts()
		const initialLength = productsData.products.length

		productsData.products = productsData.products.filter(
			product => product.id !== productId
		)

		if (productsData.products.length === initialLength) {
			return res.status(404).json({
				success: false,
				error: 'Mahsulot topilmadi',
			})
		}

		productsData.lastUpdated = new Date().toISOString()
		productsData.metadata.totalProducts = productsData.products.length

		const saved = await saveProducts(productsData)

		if (saved) {
			res.json({
				success: true,
				message: "Mahsulot o'chirildi",
			})
		} else {
			throw new Error("Mahsulotni o'chirishda xatolik")
		}
	} catch (error) {
		res.status(500).json({
			success: false,
			error: error.message,
		})
	}
})

// Statistics
app.get('/api/stats', async (req, res) => {
	try {
		const ordersData = await loadOrders()
		const productsData = await loadProducts()
		const orders = ordersData.orders

		const stats = {
			totalOrders: orders.length,
			newOrders: orders.filter(o => o.status === 'new').length,
			processingOrders: orders.filter(o => o.status === 'processing').length,
			completedOrders: orders.filter(o => o.status === 'completed').length,
			cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
			totalRevenue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
			uniqueCustomers: new Set(orders.map(o => o.customerPhone)).size,
			totalProducts: productsData.products.length,
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

// Static routes
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, './index.html'))
})

app.get('/admin', (req, res) => {
	res.sendFile(path.join(__dirname, './admin.html'))
})
app.get('/admin', (req, res) => {
	res.sendFile(path.join(__dirname, 'admin', 'admin.html'))
})

// Start server
async function startServer() {
	try {
		await ensureDataFiles()

		app.listen(PORT, () => {
			console.log('🚀 TechStore Server ishga tushdi!')
			console.log(`📍 Server manzili: http://localhost:${PORT}`)
			console.log(`🏪 Asosiy do'kon: http://localhost:${PORT}`)
			console.log(`⚙️  Admin panel: http://localhost:${PORT}/admin`)
			console.log(`📊 API Orders: http://localhost:${PORT}/api/orders`)
			console.log(`📦 API Products: http://localhost:${PORT}/api/products`)
			console.log('📁 Orders fayli:', ORDERS_FILE)
			console.log('📁 Products fayli:', PRODUCTS_FILE)
		})
	} catch (error) {
		console.error('❌ Serverni ishga tushirishda xatolik:', error)
	}
}

startServer()
