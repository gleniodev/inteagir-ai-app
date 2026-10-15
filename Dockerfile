FROM node:24-bookworm-slim AS frontend
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

FROM python:3.14-slim-bookworm AS runtime
COPY --from=node:24-bookworm-slim /usr/local/bin/node /usr/local/bin/node
COPY --from=node:24-bookworm-slim /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
 && apt-get update && apt-get install -y --no-install-recommends git ca-certificates libatomic1 \
 && rm -rf /var/lib/apt/lists/* \
 && npm install -g @openai/codex@0.162.1
WORKDIR /app
ARG HERMES_COMMIT=0e427d788d253630d38a3a51cd76849e73cd6925
RUN git clone https://github.com/NousResearch/hermes-agent.git .local/hermes-src \
 && cd .local/hermes-src && git checkout "$HERMES_COMMIT" \
 && python -m pm.build_env --source /app/.local/hermes-src --python /usr/local/bin/python3 \
    --out /app/.local/hermes-src/.venv --sealed --record-selection --extra web --extra sms
COPY --from=frontend /app/node_modules ./node_modules
COPY --from=frontend /app/dist ./dist
COPY package*.json ./
COPY server ./server
COPY shared ./shared
COPY fixtures ./fixtures
COPY scripts ./scripts
COPY deploy/container-start.js ./deploy/container-start.js
RUN useradd --uid 10001 --create-home inteagir \
 && mkdir -p server/data server/uploads server/media .local/hermes-profile .local/codex-image-profile \
 && chown -R 10001:10001 server/data server/uploads server/media .local/hermes-profile .local/codex-image-profile
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3001 INTEAGIR_HERMES_PYTHON=/app/.local/hermes-src/.venv/bin/python
USER 10001:10001
EXPOSE 3001
CMD ["node", "deploy/container-start.js"]
