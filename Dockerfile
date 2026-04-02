# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies including devDependencies (needed for build)
RUN npm install

# Copy all files
COPY . .

# Build the application (tsx script/build.ts)
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Copy built assets from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
COPY --from=build /app/config.yml ./

# Install only production dependencies
RUN npm install --omit=dev

# Expose the application port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
