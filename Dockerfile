FROM httpd:2.4
COPY . /usr/local/apache2/htdocs/
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