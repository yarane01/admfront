FROM httpd:2.4
COPY ./Dockerfile /usr/local/apache2/htdocs/
COPY ./entrypoint.sh /usr/local/apache2/htdocs/
RUN mkdir -p /usr/local/apache2/htdocs/admin
COPY ./admin /usr/local/apache2/htdocs/admin
COPY ./admin/revision.js /usr/local/apache2/htdocs/admin/healthcheck
RUN mkdir -p /usr/local/apache2/htdocs/.git
COPY .git /usr/local/apache2/htdocs/.git
ARG TRADESERVER_URL
ARG BACKEND_URL
ARG STP_URL
ARG BEACON_URL
ARG REPORTINGSERVICE_URL
WORKDIR /usr/local/apache2/htdocs
RUN sh entrypoint.sh
RUN echo 'Done'
