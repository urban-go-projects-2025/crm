@echo off
echo Starting OMW CRM Backend Server and React Vite Frontend...
start cmd /k "node server.js"
start cmd /k "npx vite --host"
echo OMW CRM is running!
echo Backend API: http://localhost:5000
echo Frontend Dashboard: http://localhost:3000
