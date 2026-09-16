# syntax=docker/dockerfile:1

FROM node:24-alpine AS deps
WORKDIR /app

# Met à jour les paquets Alpine au début du build et nettoie le cache
# pour garder l'image aussi légère que possible.
RUN apk update && apk upgrade --no-cache

COPY package.json package-lock.json ./
RUN npm ci


FROM node:24-alpine AS builder
WORKDIR /app

# Mettre à jour les paquets dans le stage de build (si besoin de paquets système)
RUN apk update && apk upgrade --no-cache

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG SKIP_BUILD=false
ARG SKIP_PRISMA=false
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
ARG NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
ARG NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/dashboard
ARG NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/

ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_CLERK_SIGN_UP_URL=$NEXT_PUBLIC_CLERK_SIGN_UP_URL
ENV NEXT_PUBLIC_CLERK_SIGN_IN_URL=$NEXT_PUBLIC_CLERK_SIGN_IN_URL
ENV NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=$NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL
ENV NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=$NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL


RUN if [ "$SKIP_PRISMA" != "true" ]; then npx prisma generate; else echo "Skipping prisma generate (SKIP_PRISMA=true)"; fi
RUN if [ "$SKIP_BUILD" != "true" ]; then npm run build; else echo "Skipping build (SKIP_BUILD=true)"; fi

FROM node:24-alpine AS runner
WORKDIR /app

# Mise à jour minimale dans l'image finale pour s'assurer des correctifs de sécurité
RUN apk update && apk upgrade --no-cache

# Supprimer npm/npx pour réduire la surface d'attaque (Trivy)
RUN rm -rf /usr/local/lib/node_modules/npm
RUN rm -f /usr/local/bin/npm /usr/local/bin/npx

ENV NODE_ENV=production

# Utilisateur non-root : si jamais le conteneur est compromis, l'attaquant
# n'a pas les droits root à l'intérieur.
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]