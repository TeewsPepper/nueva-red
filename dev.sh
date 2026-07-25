#!/bin/bash
echo "⛪ Iniciando Iglesia Agenda..."
echo "📦 Backend: http://localhost:5000"
echo "📦 Frontend: http://localhost:5173"
echo ""
cd backend && npm run dev &
cd frontend && npm run dev &
wait
