This is an API built using express.js in node.js. It serves as the backend for a web application, providing endpoints for various functionalities.

# Table of Contents
- [Table of Contents](#table-of-contents)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
  - [HPC endpoints:](#hpc-endpoints)
    - [`GET /hpc`:](#get-hpc)
    - [`POST /hpc/add`:](#post-hpcadd)
    - [`GET /hpc/id/:id`:](#get-hpcidid)
    - [`GET /hpc/name/:name`:](#get-hpcnamename)
    - [`DELETE /hpc/delete`:](#delete-hpcdelete)
  - [Instruction endpoints:](#instruction-endpoints)
    - [`GET /instruction/:id`:](#get-instructionid)
    - [`GET /instruction/all/:id`:](#get-instructionallid)
    - [`GET /instruction/specific/:id`:](#get-instructionspecificid)
    - [`GET /instruction/specific/all/:id`:](#get-instructionspecificallid)
  - [Method endpoints:](#method-endpoints)
    - [`GET /method/:id`:](#get-methodid)
    - [`GET /method/id/:id`:](#get-methodidid)
  - [People endpoints:](#people-endpoints)
    - [`GET /people`:](#get-people)
    - [`POST /people/add`:](#post-peopleadd)
    - [`GET /people/id/:id`:](#get-peopleidid)
    - [`GET /people/name/:name`:](#get-peoplenamename)
    - [`DELETE /people/delete`:](#delete-peopledelete)
  - [Report endpoints:](#report-endpoints)
    - [`GET /report/today`:](#get-reporttoday)
    - [`GET /report/person/:id`:](#get-reportpersonid)
    - [`GET /report/cluster/:id`:](#get-reportclusterid)
    - [`GET /report/id/:id`:](#get-reportidid)
    - [`POST /report/add`:](#post-reportadd)
    - [`DELETE /report/delete`:](#delete-reportdelete)
  - [Rota endpoints:](#rota-endpoints)
    - [`GET /rota`:](#get-rota)
    - [`GET /rota/day/:day`:](#get-rotadayday)
    - [`GET /rota/cluster/:id`:](#get-rotaclusterid)
    - [`GET /rota/person/:id`:](#get-rotapersonid)

# Getting Started
To get started with this API, follow these steps:
```sh
   # Install dependencies
   npm i 

   # Start the server
   npm run start
```

# API Endpoints
These are all the endpoints available in the API broken down by category. Each endpoint includes a brief description of its functionality and the expected input/output.

---
## HPC endpoints:
### `GET /hpc`:
This endpoint retrieves a list of all the HPC's in the database showing their name and id.
### `POST /hpc/add`:
This endpoint allows users to add a new HPC to the database. It expects a JSON body with the following structure:
```json
{
  "name": "HPC Name"
}
```
### `GET /hpc/id/:id`:
This endpoint retrieves the details of a specific HPC based on its ID. The response will include the HPC's name and id.
### `GET /hpc/name/:name`:
This endpoint retrieves the details of a specific HPC based on its name. The response will include the HPC's name and id.
### `DELETE /hpc/delete`:
This endpoint allows users to delete an HPC from the database along with its associated data. It expects a JSON body with the following structure:
```json
{
  "id": "HPC ID"
}
```

---
## Instruction endpoints:
### `GET /instruction/:id`:
This endpoint retrieves the details of a all the instructions associated with a specific HPC based on its ID excluding methods.
### `GET /instruction/all/:id`:
This endpoint retrieves the details of a all the instructions associated with a specific HPC based on its ID including methods.
### `GET /instruction/specific/:id`:
This endpoint retrieves the details of a specific instruction based on its ID excluding methods.
### `GET /instruction/specific/all/:id`:
This endpoint retrieves the details of a specific instruction based on its ID including methods.

---
## Method endpoints:
### `GET /method/:id`:
This endpoint retrieves all the details about methods associated with a specific instruction based on its ID.
### `GET /method/id/:id`:
This endpoint retrieves the details of a specific method based on its ID.

## People endpoints:
### `GET /people`:
This endpoint retrieves a list of all the people in the database showing their name and id.

### `POST /people/add`:
This endpoint allows users to add a new person to the database. It expects a JSON body with the following structure:
```json
{
  "name": "Person Name"
}
```

### `GET /people/id/:id`:
This endpoint retrieves the details of a specific person based on their ID. The response will include the person's name and id.

### `GET /people/name/:name`:
This endpoint retrieves the details of a specific person based on their name. The response will include the person's name and id.

### `DELETE /people/delete`:
This endpoint allows users to delete a person from the database along with their associated data. It expects a JSON body with the following structure:
```json
{
  "id": "Person ID"
}
```

---
## Report endpoints:
### `GET /report/today`:
This endpoint retrieves all of the reports from the current day.

### `GET /report/person/:id`:
This endpoint retrieves all of the reports associated with a specific person based on their ID.

### `GET /report/cluster/:id`:
This endpoint retrieves all of the reports associated with a specific cluster based on its ID.

### `GET /report/id/:id`:
This endpoint retrieves the details of a specific report based on its ID.

### `POST /report/add`:
This endpoint allows users to add a new report to the database. It expects a JSON body with the following structure:
```json
{
   "person_id": "Person ID",
   "cluster_id": "Cluster ID",
   "startTime": 0000000000,
   "endTime": 0000000000,
   "results": [
      { 
         {
            "instructionId": "Instruction ID",
            "passed": true, // Whether the instruction was passed or not
            "note": "Note about the instruction if added"
         }
      }
   ],
}
```

### `DELETE /report/delete`:
This endpoint allows users to delete a report from the database. It expects a JSON body with the following structure:
```json
{
  "id": "Report ID"
}
```

---
## Rota endpoints:
### `GET /rota`:
This endpoint retrieves the rota for the current week showing the people assigned to each cluster for each day.

### `GET /rota/day/:day`:
This endpoint retrieves the rota for a specific day showing the people assigned to each cluster for that day. The `:day` parameter should be the name of the day (e.g., mon, tue, wed, thu, fri).

### `GET /rota/cluster/:id`:
This endpoint retrieves the rota for a specific cluster based on its ID showing the people assigned to that cluster for each day.

### `GET /rota/person/:id`:
This endpoint retrieves the rota for a specific person based on their ID showing the clusters they are assigned to for each day.