# Use the official Nginx Alpine image
FROM nginx:alpine

# Copy all files to /usr/share/nginx/html
COPY . /usr/share/nginx/html

# By default, Nginx will serve index.html at /
# If you have custom server configs, you can override /etc/nginx/conf.d/default.conf
