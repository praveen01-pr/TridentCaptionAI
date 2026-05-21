FROM node:18-alpine

# Set directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy application source
COPY . .

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Build project
RUN npm run build

# Expose server port
EXPOSE 3000

# Start server
CMD ["npm", "run", "start"]
