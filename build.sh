#!/bin/bash
echo "📦 Construyendo para producción..."
cd backend && npm run build
cd ../frontend && npm run build
echo "✅ Build completado!"
