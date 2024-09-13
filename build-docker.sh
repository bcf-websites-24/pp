#!/bin/sh

docker build -t csefest2024-pp .      
# docker tag csefest2024 risenfromashes/text-embedding:latest  
# docker push risenfromashes/text-embedding:latest 
docker run -p 80:3000 csefest2024-pp