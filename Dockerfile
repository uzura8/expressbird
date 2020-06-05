FROM ubuntu:18.04
USER root

RUN apt-get -y update
RUN apt-get -y install software-properties-common
RUN apt-get install -y curl
#RUN apt-get -y install vim
#RUN apt-get -y install build-essential

RUN apt-get -y update && apt-get -y install nginx
RUN rm /etc/nginx/sites-enabled/default
COPY ./nginx/default.conf /etc/nginx/conf.d/

RUN apt-get -y install nodejs npm
RUN npm install n -g
RUN n stable

ADD . /gratefulchat
WORKDIR /gratefulchat

RUN npm install --no-optional -g pm2
RUN npm install
RUN npm run build

EXPOSE 80

#CMD ["pm2", "--no-daemon", "start", "/gratefulchat/server/app.js"]
CMD ["/bin/bash", "/gratefulchat/startup.sh"]

