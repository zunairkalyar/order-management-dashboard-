#!/bin/bash

# Generate Prisma Client
echo "Generating Prisma Client..."
npx prisma generate

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Build TypeScript
echo "Building TypeScript..."
npm run build

echo "Build completed successfully!"
