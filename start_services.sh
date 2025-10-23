#!/bin/bash

# Start all health check services for the medical application

echo "Starting medical application health check services..."

# Make Python scripts executable
chmod +x services/segmentation_service.py
chmod +x services/volumetry_service.py
chmod +x services/analysis_service.py

# Start services in background
echo "Starting Segmentation Agent on port 8001..."
python3 services/segmentation_service.py &
SEGMENTATION_PID=$!

echo "Starting Volumetry Agent on port 8002..."
python3 services/volumetry_service.py &
VOLUMETRY_PID=$!

echo "Starting Analysis Agent on port 8003..."
python3 services/analysis_service.py &
ANALYSIS_PID=$!

echo ""
echo "All services started successfully!"
echo "Segmentation Agent: http://localhost:8001/health (PID: $SEGMENTATION_PID)"
echo "Volumetry Agent: http://localhost:8002/health (PID: $VOLUMETRY_PID)"
echo "Analysis Agent: http://localhost:8003/health (PID: $ANALYSIS_PID)"
echo ""
echo "To stop all services, run: pkill -f 'python3 services/'"
echo "Or manually kill PIDs: $SEGMENTATION_PID $VOLUMETRY_PID $ANALYSIS_PID"

# Keep script running to show logs
wait
