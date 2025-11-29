# Base AWS Lambda Node 20
FROM public.ecr.aws/lambda/nodejs:20 AS base

# Copy all sources
COPY package*.json ./
COPY prisma ./prisma
COPY src ./src

# Install all deps (including devDependencies)
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript → dist/
RUN npm run build

# Production image
FROM public.ecr.aws/lambda/nodejs:20 AS prod

# Install runtime deps only
COPY package*.json ./
RUN npm install --omit=dev

# Copy Prisma runtime artifacts
COPY prisma ./prisma
COPY --from=base /var/task/node_modules/.prisma ./node_modules/.prisma

# Copy application
COPY --from=base /var/task/dist ./dist
COPY --from=base /var/task/node_modules ./node_modules

# Lambda entrypoint
CMD ["dist/index.handler"]
