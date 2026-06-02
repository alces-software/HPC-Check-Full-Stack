# HPC-Check-Full-Stack
Full stack web application for managing hpc check-ins

# Installation

clone the repo with `git clone https://github.com/alces-software/HPC-Check-Full-Stack`

TODO: Add setup for mongodb

in both the backend and frontend folders, create `.env` files from the examples and fill out the relevant fields

## Docker

Ensure docker is installed, docker-compose is installed, and the docker daemon is running

run `docker-compose up` in the root directory

## Not Docker

Ensure node is installed

run `npm i` in both frontend and backend

In one console session, `cd` into `./frontend` and run `npm run dev` (TODO: Add proper build environment)

In another console session, `cd` into `./backend` and run `npm run start`