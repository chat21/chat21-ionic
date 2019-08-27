### STAGE 1: Build ###

# We label our stage as ‘builder’
FROM node:10-alpine as builder

WORKDIR /app

COPY . ./

RUN npm install


### STAGE 2: Setup ###

FROM nginx:1.14.1-alpine

## Copy our default nginx config
#COPY nginx/default.conf /etc/nginx/conf.d/
COPY nginx.conf /etc/nginx/nginx.conf

## Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

WORKDIR /usr/share/nginx/html
COPY platforms/browser/www/ .

RUN echo "Chat21 Ionic Started!!"


CMD ["nginx", "-g", "daemon off;"]



