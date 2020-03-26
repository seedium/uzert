#!/usr/bin/env bash

# 1. Build fresh packages and move them to sample and integration directories
npm run build &>/dev/null

# 2. Start docker containers to perform integration tests
npm run test:docker:up

# initialize mongo replica set
docker exec mongo0 mongo --eval "rs.initiate(); rs.add('mongo1'); rs.add('mongo2')"
docker exec mongo0 mongo --eval "conf = rs.conf(); conf.members[0].priority = 2; rs.reconfig(conf)"

# Check mongo status
docker exec mongo0 mongo --eval "rs.status()"
