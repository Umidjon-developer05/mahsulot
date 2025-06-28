// JSON fayl boshqaruvi uchun utility funksiyalar
class JSONFileManager {
	constructor(fileName = 'orders.json') {
		this.fileName = fileName
		this.storageKey = 'techstore_orders_json'
	}

	// Ma'lumotlarni JSON fayl sifatida yuklab olish
	downloadAsJSON(data) {
		try {
			const jsonString = JSON.stringify(data, null, 2)
			const blob = new Blob([jsonString], { type: 'application/json' })
			const url = URL.createObjectURL(blob)

			const link = document.createElement('a')
			link.href = url
			link.download = this.fileName
			document.body.appendChild(link)
			link.click()
			document.body.removeChild(link)

			URL.revokeObjectURL(url)
			return true
		} catch (error) {
			console.error('JSON yuklab olishda xatolik:', error)
			return false
		}
	}

	// JSON faylni o'qish
	async readJSONFile(file) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader()

			reader.onload = e => {
				try {
					const data = JSON.parse(e.target.result)
					resolve(data)
				} catch (error) {
					reject(new Error("Noto'g'ri JSON format"))
				}
			}

			reader.onerror = () => reject(new Error("Faylni o'qishda xatolik"))
			reader.readAsText(file)
		})
	}

	// localStorage dan ma'lumotlarni olish
	getFromStorage() {
		try {
			const data = localStorage.getItem(this.storageKey)
			return data ? JSON.parse(data) : null
		} catch (error) {
			console.error("localStorage dan o'qishda xatolik:", error)
			return null
		}
	}

	// localStorage ga ma'lumotlarni saqlash
	saveToStorage(data) {
		try {
			localStorage.setItem(this.storageKey, JSON.stringify(data))
			return true
		} catch (error) {
			console.error('localStorage ga saqlashda xatolik:', error)
			return false
		}
	}

	// Buyurtmani qo'shish
	addOrder(orderData) {
		const currentData = this.getFromStorage() || {
			orders: [],
			lastUpdated: new Date().toISOString(),
			metadata: { totalOrders: 0 },
		}

		// Telefon ID yaratish
		const phoneId = orderData.customerPhone.replace(/[^0-9]/g, '')
		const timestamp = Date.now()

		const newOrder = {
			id: `${phoneId}_${timestamp}`,
			orderId: timestamp,
			phoneId: phoneId,
			...orderData,
			status: 'new',
			orderDate: new Date().toISOString(),
		}

		currentData.orders.unshift(newOrder)
		currentData.lastUpdated = new Date().toISOString()
		currentData.metadata.totalOrders = currentData.orders.length

		this.saveToStorage(currentData)
		return newOrder
	}
}

// Global instance
window.jsonFileManager = new JSONFileManager()
