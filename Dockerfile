### STAGE 1: Build ###

# We label our stage as ‘builder’
FROM node:10-alpine as builder

WORKDIR /app

COPY . ./

RUN npm install


RUN cordova platform add browser@latest

RUN ionic cordova build browser




