## Fastify Resty API Blog example :memo:

The current example application shows the key features of `Fastify Resty` for building fast and declarative API using TypeORM and PostgreSQL database.

### Description :link:

There are 3 types of controllers implemented:

- :wrench: Automatic zero-configuration controller `author.controller.ts` for TypeORM entity
- :wrench: Custom controller `generator.controller.ts` without model entity binding using custom service `generator.service.ts` with logic
- :wrench: Automatic controller `post.controller.ts` with additional custom route and hook, using service with model integration

As the result we will have the following API routes structure:

```
└── /
    ├── authors (GET|POST|PATCH|PUT|DELETE)
    │   └── / (GET|POST|PATCH|PUT|DELETE)
    │       └── :id (GET)
    │           :id (PATCH)
    │           :id (PUT)
    │           :id (DELETE)
    ├── generate/
    │   ├── author (GET)
    │   └── post (GET)
    └── posts (GET|POST|PATCH|PUT|DELETE)
        └── / (GET|POST|PATCH|PUT|DELETE)
            ├── :id (GET)
                :id (PATCH)
                :id (PUT)
                :id (DELETE)
            │   └── /author (GET)
            └── random (GET)
```

### Requirements :white_check_mark:

To run this application you need to have the following tools installed on your machine:

- [Node.js](https://nodejs.org) (>8.15)
- [PostgreSQL](https://www.postgresql.org/) (>9) (Check the notes at the bottom of this README to get additional help)

### Run :gear:

To start the application using `ts-node` simply run:

```sh
$ yarn start
```

### Build :hammer:

You are able to compile application typescript sources to native javascript and run it.
To do it, you need to execute the following commands:

```sh
$ yarn build
$ cd dist
$ node src/app.js
```

### Helpful Notes :moyai:

There are a few ways to up and run the Postgres database for the current API example.
You could download and install it from the official [postgresql download page](https://www.postgresql.org/download/), or
run it in a quicker way using following [Docker :whale:](https://www.docker.com/) CLI command:

```sh
$ docker run --name postgres-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
```
