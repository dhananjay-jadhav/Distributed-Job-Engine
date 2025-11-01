FROM ghcr.io/apollographql/router:v2.1.0

# Copy router configuration
COPY router.yaml /dist/config/router.yaml

# Set the supergraph schema path (will be mounted as volume)
ENV APOLLO_ROUTER_CONFIG_PATH=/dist/config/router.yaml
ENV APOLLO_ROUTER_SUPERGRAPH_PATH=/dist/config/supergraph-schema.graphql

# Expose the router port and health check port
EXPOSE 4000 8088

# The router will be started with the default command
ENTRYPOINT ["/dist/router"]
CMD ["--config", "/dist/config/router.yaml", "--supergraph", "/dist/config/supergraph-schema.graphql"]
