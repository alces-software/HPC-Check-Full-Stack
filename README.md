# HPC-Check-Full-Stack
Full stack web application for managing hpc check-ins

# Installation

Clone the repo with `git clone https://github.com/alces-software/HPC-Check-Full-Stack`

## Docker

Ensure [docker](https://docs.docker.com/engine/install/) is installed, docker-compose is installed, and the docker daemon is running

`systemctl status docker`

Rename or copy the `example.env` files in the frontend and backend folders to `.env`

In the `frontend/.env` file, set the `NEXT_PUBLIC_API_URL` to be `http://<hostname>:81`

In the `backend/.env` file, set the `MONGO_URI` to be `mongodb://database:27017`

run `docker-compose up` in the root directory

## Not Docker

Ensure node is installed

[Create and run a MongoDB server](https://www.mongodb.com/resources/products/fundamentals/create-database)

In the `backend/.env` file, set the `MONGO_URI` to be `mongodb://<database_hostname>:27017`

In the `frontend/.env` file, set the `NEXT_PUBLIC_API_URL` to be `http://<hostname>:<port>`

In one console session, `cd` into `./frontend` and run `./setup.sh`

In another console session, `cd` into `./backend` and run `./setup.sh`