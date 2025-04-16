FROM node:18.20.4

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

EXPOSE 5000

ENV MONGODB_USERNAME=root
ENV MONGODB_PASSWORD=secret

CMD ["npm", "start"]