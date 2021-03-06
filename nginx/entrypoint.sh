#!/bin/sh

set -e
# set -x

[ -z "$UPSTREAM_PWA" ] && echo "UPSTREAM_PWA is not set" && exit 1

if echo "$UPSTREAM_PWA" | grep -Eq '^https'
then
  cat >/etc/nginx/conf.d/listen.conf <<EOF
listen 443 ssl;
ssl_certificate     server.crt;
ssl_certificate_key server.key;
ssl_protocols       TLSv1 TLSv1.1 TLSv1.2;
ssl_ciphers         HIGH:!aNULL:!MD5;

# https://ma.ttias.be/force-redirect-http-https-custom-port-nginx/
error_page  497 https://\$http_host\$request_uri;

EOF
else
  echo "listen 80;" >/etc/nginx/conf.d/listen.conf
fi

[ -f "/etc/nginx/conf.d/default.conf" ] && rm /etc/nginx/conf.d/default.conf

i=1
while true
do
  eval "export SUBDOMAIN=\$PWA_${i}_SUBDOMAIN"
  eval "export TOPLEVELDOMAIN=\$PWA_${i}_TOPLEVELDOMAIN"
  eval "export DOMAIN=\$PWA_${i}_DOMAIN"

  if [ ! -z "$DOMAIN" ]
  then
    [ ! -z "$SUBDOMAIN" ] && echo "ignoring PWA_${i}_SUBDOMAIN as PWA_${i}_DOMAIN is set"
    [ ! -z "$TOPLEVELDOMAIN" ] && echo "ignoring PWA_${i}_TOPLEVELDOMAIN as PWA_${i}_DOMAIN is set"
  else
    if [ ! -z "$SUBDOMAIN" ]
    then
      [ ! -z "$TOPLEVELDOMAIN" ] && echo "ignoring PWA_${i}_TOPLEVELDOMAIN as PWA_${i}_SUBDOMAIN is set"
      export DOMAIN="$SUBDOMAIN\..+"
    else
      [ ! -z "$TOPLEVELDOMAIN" ] && export DOMAIN=".+\.$TOPLEVELDOMAIN"
    fi
  fi

  [ -z "$DOMAIN" ] && [ "$i" = "1" ] && export DOMAIN=".+"
  [ -z "$DOMAIN" ] && break

  eval "export CHANNEL=\${PWA_${i}_CHANNEL:-'default'}"
  eval "export APPLICATION=\${PWA_${i}_APPLICATION:-'default'}"
  eval "export LANG=\${PWA_${i}_LANG:-'default'}"
  eval "export FEATURES=\${PWA_${i}_FEATURES:-'default'}"
  eval "export THEME=\${PWA_${i}_THEME:-'default'}"

  echo "$i DOMAIN=$DOMAIN CHANNEL=$CHANNEL APPLICATION=$APPLICATION LANG=$LANG FEATURES=$FEATURES THEME=$THEME"

  envsubst '$UPSTREAM_PWA,$DOMAIN,$CHANNEL,$APPLICATION,$LANG,$FEATURES,$THEME' </etc/nginx/conf.d/channel.conf.tmpl >/etc/nginx/conf.d/channel$i.conf

  i=$((i+1))
done

# Generate Pagespeed config based on environment variables
env | grep NPSC_ | sed -e 's/^NPSC_//g' -e "s/\([A-Z_]*\)=/\L\1=/g" -e "s/_\([a-zA-Z]\)/\u\1/g" -e "s/^\([a-zA-Z]\)/\u\1/g" -e 's/=.*$//' -e 's/\=/ /' -e 's/^/\pagespeed /' > /tmp/pagespeed-prefix.txt

env | grep NPSC_ | sed -e 's/^[^=]*=//' -e 's/$/;/' > /tmp/pagespeed-suffix.txt

paste -d" " /tmp/pagespeed-prefix.txt /tmp/pagespeed-suffix.txt >> /etc/nginx/pagespeed.conf

[ ! -z "$DEBUG" ] && find /etc/nginx -name '*.conf' -print -exec cat '{}' \;

if [ -z "$*" ]
then
  /usr/local/nginx/sbin/nginx -c /etc/nginx/nginx.conf -g "daemon off;"
else
  exec "$@"
fi
