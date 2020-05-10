FROM node:latest
USER root
WORKDIR /


RUN npm install -g serve



RUN mkdir /root/avitofrontend && cd /root/avitofrontend
COPY . /root/avitofrontend
RUN cd /root/avitofrontend

EXPOSE 3000

RUN cd /root/avitofrontend && npm install

ARG REACT_APP_API_URL=local
ENV REACT_APP_API_URL ${REACT_APP_API_URL}

CMD cd /root/avitofrontend && npm run build && serve -s build -l 3000 || exit 1