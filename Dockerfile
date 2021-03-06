FROM buildkite/puppeteer:latest
WORKDIR /3box-simulation
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y git
COPY package.json /3box-simulation/package.json
ADD  package-lock.json /3box-simulation/package-lock.json
RUN npm install
COPY src /3box-simulation/src
EXPOSE  8011
CMD npm run start
