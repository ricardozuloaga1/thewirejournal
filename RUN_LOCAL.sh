#!/bin/bash

echo "🚀 Starting The Wire Journal..."
echo ""

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Open two new terminal tabs
echo "Opening backend terminal..."
osascript -e 'tell application "Terminal" to do script "cd \"'$(pwd)'/backend\" && source venv/bin/activate && python app.py"'

sleep 2

echo "Opening frontend terminal..."
osascript -e 'tell application "Terminal" to do script "cd \"'$(pwd)'/frontend\" && npm run dev"'

echo ""
echo "✅ Done!"
echo ""
echo "🌐 Your app will be running at:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:5000"
echo ""
echo "📝 First time? Run these commands first:"
echo "   cd backend && pip install -r requirements.txt"
echo "   cd frontend && npm install"
