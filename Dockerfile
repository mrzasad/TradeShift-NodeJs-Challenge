# ################################################################
# Docker file for wrapping nodejs service components
# Copyright 2019-20 AionDigital 
# ################################################################

# Using latest LTS version running on alpine
FROM node:12.18.2-alpine

# Will remain same for all containers.
# Version will be changed during CI/CD process
LABEL maintainer="AionDigital"
LABEL version="0.1.0 (alpha)"
LABEL description="Container for running conduit service component"
ARG PORT=4005
ARG WORKDIR=/home/aiondigital/conduit
ARG USER=node
ARG NODE_ENV=production

# Setting environemnt variables
# These variables will be different from application to application
ENV ENV_CDT_PORT=${PORT} \
    NODE_ENV=${NODE_ENV} \
    ENV_CDT_SOURCE=static \
    ENV_CDT_BASE_PATH='/api/fs/es/static/'

# Set container timezone
RUN apk add --no-cache tzdata
ENV TZ Asia/Kuwait
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Strict file permission for passwd, shadow and group files
RUN chmod -R 644 /etc/passwd && \
    chown root:root /etc/shadow && \
    chmod 000 /etc/shadow && \
    chmod -R 644 /etc/group

# Expose port 4000 to the host     
EXPOSE ${PORT}

# Working directory on which application binaries will be copied
WORKDIR ${WORKDIR}

COPY package*.json ./

# Provide require authorities and run npm install
RUN chown -R $USER:$USER ${WORKDIR} && \
    chmod 770 -R ${WORKDIR} && \
    npm install --slient && npm install --only=dev --slient

# Copy all content from this folder (including subfolders)
# to a specific folder on the container
COPY . .

# Build
RUN npm run build:prod

# Remove the devDependencies
RUN npm prune --production

RUN rm -rf app bin config lib utilities

# Set user node for future commands
USER $USER

# RUN following command
CMD npm run start:prod