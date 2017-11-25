FROM node:8.9.1-alpine
MAINTAINER "contact@koumoul.com"

ENV NODE_ENV production
WORKDIR /webapp
ADD webpack.config.js /webapp/webpack.config.js
ADD .babelrc /webapp/.babelrc

ADD package.json /webapp/package.json
ADD package-lock.json /webapp/package-lock.json

# Adding UI files
ADD public /webapp/public
RUN npm install && npm run build && npm prune

# Adding server files
ADD server /webapp/server
ADD contract /webapp/contract
ADD resources /webapp/resources
ADD config /webapp/config
ADD README.md /webapp/README.md

VOLUME /webapp/data
EXPOSE 8080

CMD ["node", "server/app.js"]
