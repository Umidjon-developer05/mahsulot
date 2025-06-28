#!/bin/bash

echo "🚀 TechStore Server o'rnatilmoqda..."

# Node.js va npm mavjudligini tekshirish
if ! command -v node &> /dev/null; then
    echo "❌ Node.js topilmadi. Iltimos, Node.js o'rnating: https://nodejs.org/"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm topilmadi. Iltimos, npm o'rnating."
    exit 1
fi

echo "✅ Node.js va npm topildi"

# server papkasiga o'tish
cd "$(dirname "$0")"

echo "📦 Dependencies o'rnatilmoqda..."

# npm packages o'rnatish
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies muvaffaqiyatli o'rnatildi"
    echo ""
    echo "🎉 O'rnatish tugallandi!"
    echo ""
    echo "📋 Serverni ishga tushirish uchun:"
    echo "   cd server"
    echo "   npm start"
    echo ""
    echo "🌐 Server manzillari:"
    echo "   Asosiy do'kon: http://localhost:3000"
    echo "   Admin panel: http://localhost:3000/admin"
    echo "   API: http://localhost:3000/api/orders"
else
    echo "❌ Dependencies o'rnatishda xatolik yuz berdi"
    exit 1
fi
