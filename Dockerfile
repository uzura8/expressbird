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

ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION 12.16.0

# nvm environment variables
ENV NVM_DIR /root/.nvm
#ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION 12.16.0

# install nvm
# https://github.com/creationix/nvm#install-script
RUN curl --silent -o- https://raw.githubusercontent.com/creationix/nvm/v0.35.3/install.sh | bash \
    && source $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

## install node and npm
#RUN source $NVM_DIR/nvm.sh \
#    && nvm install $NODE_VERSION \
#    && nvm alias default $NODE_VERSION \
#    && nvm use default

    #&& . $NVM_DIR/nvm.sh \

# add node and npm to path so the commands are available
ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

# confirm installation
RUN node -v
RUN npm -v

#RUN apt-get update --fix-missing && \
#	#apt-get install -y curl && \
#	##############################################################################
#	# Install: nvm, node and npm
#	# @see: http://stackoverflow.com/questions/25899912/install-nvm-in-docker
#	##############################################################################
#	curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.35.3/install.sh | bash && \
#	source $NVM_DIR/nvm.sh && \
#	nvm install $NODE_VERSION && \
#	nvm cache clear && \
#	apt-get remove -y curl && \
#	rm -rf /var/lib/apt/lists/*
#
##ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH
##nvm install "v${NODE_VERSION}"
#node -v
#npm -v

#RUN apt-get -y update && apt-get -y install nodejs npm
#RUN npm install n -g
#RUN n stable

ADD . /gratefulchat
WORKDIR /gratefulchat

RUN npm install --no-optional -g pm2
RUN npm install
RUN npm run build

EXPOSE 80

#CMD ["pm2", "--no-daemon", "start", "/gratefulchat/server/app.js"]
CMD ["/bin/bash", "/gratefulchat/startup.sh"]

