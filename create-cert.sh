#!/bin/bash

echo "🔐 Generating TLS certificate and key for Fadaka peer registry..."

openssl req -x509 -newkey rsa:2048 \
  -keyout server.key \
  -out server.crt \
  -days 365 \
  -nodes \
  -subj "/C=NG/ST=Lagos/L=Ikeja/O=Fadaka Blockchain/OU=Node Network/CN=localhost/kubulee.kl@gmail.com=dev@fadaka.org"

echo "✅ TLS certificate (server.crt) and key (server.key) created."
