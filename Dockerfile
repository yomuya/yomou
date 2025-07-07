FROM node:20-slim

WORKDIR /app

# Install backend dependencies
COPY package*.json ./
RUN npm install

# Install frontend dependencies and build
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

# Copy all source code
COPY . .

# Build frontend
RUN cd frontend && npm run build

# Move built frontend to backend public directory (adjust if needed)
RUN mkdir -p ./public && cp -r ./frontend/dist/* ./public/

# Expose backend port
EXPOSE 3000

# Start backend server
CMD ["npm", "start"]
