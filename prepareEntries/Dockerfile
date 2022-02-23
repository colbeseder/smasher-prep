FROM node:16

# Create app directory
WORKDIR /usr/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY prepareEntries/package*.json ./
COPY constants.sh .

RUN npm install

# Bundle app source
COPY prepareEntries/ .

CMD [ "bash", "start.sh" ]