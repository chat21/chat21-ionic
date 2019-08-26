### STAGE 1: Build ###

# We label our stage as ‘builder’
FROM node:10-alpine as builder

RUN npm install -g ionic cordova

WORKDIR /ng-app

COPY package.json package-lock.json ./

## Storing node modules on a separate layer will prevent unnecessary npm installs at each build


COPY . .

RUN npm install

## Build the angular app in production mode and store the artifacts in dist folder

RUN cordova platform add browser@latest

RUN ionic cordova build browser


### STAGE 2: Setup ###

FROM nginx:1.14.1-alpine

## Copy our default nginx config
#COPY nginx/default.conf /etc/nginx/conf.d/
COPY nginx.conf /etc/nginx/nginx.conf

## Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

## From ‘builder’ stage copy over the artifacts in dist folder to default nginx public folder
COPY --from=builder /ng-app/dist /usr/share/nginx/html

RUN echo "Chat21 Web Widget Started!!"


CMD ["nginx", "-g", "daemon off;"]



FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf

WORKDIR /usr/share/nginx/html
COPY platforms/browser/www/ .
