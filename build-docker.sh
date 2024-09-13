#!/bin/sh

docker build -t csefest2024-pp .      
docker tag csefest2024-pp registry.digitalocean.com/csefest2024-registry/csefest2024-pp:latest  
docker push registry.digitalocean.com/csefest2024-registry/csefest2024-pp:latest   