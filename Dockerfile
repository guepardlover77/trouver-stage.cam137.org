# Dockerfile pour nginx (serveur web frontend)
# Utilise avec docker-compose.yml pour l'architecture complete

FROM nginx:alpine

# Copier les fichiers compiles du frontend
COPY dist/ /usr/share/nginx/html/

# Fix permissions et renommer index.vite.html en index.html
RUN chmod -R 755 /usr/share/nginx/html && \
    mv /usr/share/nginx/html/index.vite.html /usr/share/nginx/html/index.html 2>/dev/null || true

# Note: La config nginx est montee via docker-compose depuis nginx/nginx.conf
# Pour une utilisation standalone sans docker-compose, decommenter:
# COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
