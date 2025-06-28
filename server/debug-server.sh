#!/bin/bash

echo "🔍 TechStore Server Debug Script"
echo "================================"

# Server papkasiga o'tish
cd server

echo "📋 1. Node.js versiyasini tekshirish..."
node --version
npm --version

echo ""
echo "📋 2. Dependencies tekshirish..."
if [ -d "node_modules" ]; then
    echo "✅ node_modules mavjud"
else
    echo "❌ node_modules yo'q. O'rnatilmoqda..."
    npm install
fi

echo ""
echo "📋 3. data/orders.json faylini tekshirish..."
if [ -f "../data/orders.json" ]; then
    echo "✅ orders.json mavjud"
    echo "📄 Fayl hajmi: $(wc -c < ../data/orders.json) bytes"
    echo "📄 Fayl mazmuni:"
    head -10 ../data/orders.json
else
    echo "❌ orders.json yo'q. Yaratilmoqda..."
    mkdir -p ../data
    echo '{
  "orders": [],
  "lastUpdated": "'$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")'",
  "metadata": {
    "version": "1.0",
    "description": "TechStore buyurtmalari",
    "totalOrders": 0
  }
}' > ../data/orders.json
    echo "✅ orders.json yaratildi"
fi

echo ""
echo "📋 4. Port 3000 ni tekshirish..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 3000 band. Jarayonni to'xtatish..."
    kill -9 $(lsof -ti:3000)
    sleep 2
fi

echo ""
echo "🚀 5. Serverni ishga tushirish..."
echo "📍 Server manzili: http://localhost:3000"
echo "🏪 Asosiy do'kon: http://localhost:3000"
echo "⚙️  Admin panel: http://localhost:3000/admin"
echo ""
echo "🛑 Serverni to'xtatish uchun Ctrl+C bosing"
echo ""

npm start
