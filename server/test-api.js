// API test script
const fetch = require('node-fetch')

async function testAPI() {
	console.log('🧪 Testing TechStore API...')

	try {
		// Test server health
		console.log('\n1. Testing server health...')
		const healthResponse = await fetch('http://localhost:3000/api/orders')
		console.log('Status:', healthResponse.status)
		console.log('OK:', healthResponse.ok)

		if (healthResponse.ok) {
			const data = await healthResponse.json()
			console.log('✅ Server is running')
			console.log('📊 Orders count:', data.data.orders.length)
			console.log('📄 Response:', JSON.stringify(data, null, 2))
		} else {
			console.log('❌ Server error:', healthResponse.statusText)
		}

		// Test admin page
		console.log('\n2. Testing admin page...')
		const adminResponse = await fetch('http://localhost:3000/admin')
		console.log('Admin page status:', adminResponse.status)

		if (adminResponse.ok) {
			console.log('✅ Admin page accessible')
		} else {
			console.log('❌ Admin page error:', adminResponse.statusText)
		}
	} catch (error) {
		console.error('❌ Test failed:', error.message)
		console.log('\n🔧 Troubleshooting:')
		console.log('1. Make sure server is running: npm start')
		console.log('2. Check if port 3000 is available')
		console.log('3. Verify data/orders.json exists')
	}
}

// Run test if server is expected to be running
setTimeout(testAPI, 2000)
