FROM node:8.5

WORKDIR /app

ADD package.json /app/package.json
RUN npm install --silent

ADD . /app

CMD npm start
