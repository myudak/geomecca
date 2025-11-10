# Use Nginx base image for serving the static files
FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf
## Remove default nginx index page
RUN rm -rf /usr/share/nginx/html/*
# Copy from the stage 1
COPY dist /usr/share/nginx/html
# Expose port 3004
EXPOSE 8004
# Start Nginx
ENTRYPOINT ["nginx", "-g", "daemon off;"]