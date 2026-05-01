FROM nginx:alpine

# Copy built files to nginx
COPY dist/ /usr/share/nginx/html/

EXPOSE 80