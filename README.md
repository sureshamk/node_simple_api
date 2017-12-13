# Simple API development with node + mongodb

## Required Softwares
* nodejs (>=v8.4.0)
* mongodb (>=3.4.7)
* npm (>=5.5.1)

## Installation

Install dependencies  via npm.

```bash
npm install
```
## Run the app

```bash
npm start
```

## Used dependencies

 * formidable 
 * mongodb
 
## Configuration
`config.json` contains db and app related configuration keys and values. As per your need you can modify

```json
{
  "mongo": {
    "host": "localhost",
    "port": "27017",
    "db":"simpleAPIDB",
    "collection": "customers",
    "username": "",
    "password": ""
  },
  "app": {
    "port":"8084",
    "host":"127.0.0.1"
  },
  "uploads":{
    "dir":"./uploads"
  }
}
```
