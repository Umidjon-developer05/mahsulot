#!/bin/bash

echo "🚀 TechStore Server ishga tushirilmoqda..."

# server papkasiga o'tish
cd "$(dirname "$0")"

# Dependencies tekshirish
if [ ! -d "node_modules" ]; then
    echo "📦 Dependencies topilmadi. O'rnatilmoqda..."
    npm install
fi

echo "🌟 Server ishga tushirilmoqda..."
echo "📍 Server manzili: http://localhost:3000"
echo "🏪 Asosiy do'kon: http://localhost:3000"
echo "⚙️  Admin panel: http://localhost:3000/admin"
echo ""
echo "🛑 Serverni to'xtatish uchun Ctrl+C bosing"
echo ""

# Serverni ishga tushirish
npm start
