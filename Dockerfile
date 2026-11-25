# syntax=docker/dockerfile:1.6

FROM adguard/node-ssh:22.23--0 AS base
WORKDIR /workdir
ENV YARN_CACHE_FOLDER=/yarn-cache

FROM base AS deps
RUN --mount=type=cache,target=/yarn-cache,id=block-youtube-ads-yarn \
    --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=yarn.lock,target=yarn.lock \
    yarn install --frozen-lockfile

FROM base AS source-deps
COPY --from=deps /workdir/node_modules ./node_modules
COPY . .

# =============================================================================
# Test plan
# =============================================================================
# `yarn test` is intentionally not run — this package does not contain any tests.
FROM source-deps AS test
RUN yarn lint && yarn build

FROM scratch AS test-output
COPY --from=test /workdir/dist/block-youtube-ads.user.js /block-youtube-ads.user.js
COPY --from=test /workdir/dist/extension.js /extension.js
COPY --from=test /workdir/dist/index.js /index.js
COPY --from=test /workdir/dist/remote.js /remote.js

# =============================================================================
# Build plan
# =============================================================================

FROM source-deps AS build
RUN yarn build

FROM scratch AS build-output
COPY --from=build /workdir/dist/block-youtube-ads.user.js /block-youtube-ads.user.js
COPY --from=build /workdir/dist/extension.js /extension.js
COPY --from=build /workdir/dist/index.js /index.js
COPY --from=build /workdir/dist/remote.js /remote.js
