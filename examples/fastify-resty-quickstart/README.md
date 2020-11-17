# `fastify-resty-quickstart`

> Fastify Resty Quickstart API application source

### The source code of the [Quickstart guide](https://github.com/FastifyResty/fastify-resty/blob/main/docs/Quickstart.md).

### Install and Run

Using NPM:

```sh
$ npm install
$ npm run dev
```

Using Yarn:

```sh
$ yarn
$ yarn dev
```

### Generated routes

```
Server is listening on http://127.0.0.1:8080
└── /
    └── posts (GET|POST|PATCH|PUT|DELETE)
        └── / (GET|POST|PATCH|PUT|DELETE)
            └── :id (GET)
                :id (PATCH)
                :id (PUT)
                :id (DELETE)
```