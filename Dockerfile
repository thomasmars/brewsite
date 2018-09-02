FROM node:latest
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY server/package.json /usr/src/app/
RUN npm install
COPY server /usr/src/app
EXPOSE 3000
CMD [ "npm", "start" ]
