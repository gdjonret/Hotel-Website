#!/bin/bash

# Define colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Checking if Backend-Hotel is running...${NC}"

# Try to connect to the backend
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/actuator/health 2>/dev/null)

if [ "$response" = "200" ] || [ "$response" = "401" ] || [ "$response" = "403" ]; then
    echo -e "${GREEN}✓ Backend is running!${NC}"
    echo -e "You can now test the booking flow by going to: http://localhost:3000/BookNow"
else
    echo -e "${RED}✗ Backend does not appear to be running.${NC}"
    echo -e "${YELLOW}Starting the backend...${NC}"
    
    # Navigate to the backend directory
    cd ~/Desktop/Backend-Hotel
    
    # Check if Maven wrapper exists
    if [ -f "./mvnw" ]; then
        echo -e "${YELLOW}Running: ./mvnw spring-boot:run${NC}"
        ./mvnw spring-boot:run &
        backend_pid=$!
        
        # Wait for backend to start (max 30 seconds)
        max_attempts=30
        attempt=0
        while [ $attempt -lt $max_attempts ]; do
            response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/actuator/health 2>/dev/null)
            if [ "$response" = "200" ] || [ "$response" = "401" ] || [ "$response" = "403" ]; then
                echo -e "${GREEN}✓ Backend started successfully!${NC}"
                echo -e "You can now test the booking flow by going to: http://localhost:3000/BookNow"
                break
            fi
            attempt=$((attempt+1))
            echo -e "Waiting for backend to start... ($attempt/$max_attempts)"
            sleep 1
        done
        
        if [ $attempt -eq $max_attempts ]; then
            echo -e "${RED}Failed to start backend within timeout period.${NC}"
            echo -e "Please start the backend manually by running:"
            echo -e "cd ~/Desktop/Backend-Hotel && ./mvnw spring-boot:run"
        fi
    else
        echo -e "${RED}Maven wrapper not found.${NC}"
        echo -e "Please start the backend manually by running:"
        echo -e "cd ~/Desktop/Backend-Hotel && ./mvnw spring-boot:run"
    fi
fi
