# Application Structure

**Fastify Resty** do not dictate to you how to structure your project and you are free to use any structure you want. 
But when your codebase grows you end up having long handlers. This makes your code hard to understand and it contains potential bugs.

The structure could be different depends on the goal you want to achieve, but in the general case we suggest to adhere to the following structure:

```
└── application/
    └── dist                             # compiled javascript files
    └── src                              # typescript app sources
        └── api/                         # API resources
            └── post/                    # resource routes
                └── post.controller.ts   # resource controller to handle endpoints routes
                └── post.entity.ts       # resource entity data schema
                └── post.model.ts        # resource data model to handle data-based operations (optional)
                └── post.service.ts      # resource-specific business logic (optional)
        └── libs/                        # general services and utilities (optional)
        └── config/                      # app configuration files (optional)
        └── app.ts                       # app main bootstrap
    └── tsconfig.ts                      # holds metadata and npm dependencies
    └── package.json                     # typescript compiler options
```

We highly recommend adding file type prefixes to resource files which help to identify what they actually contain and keep the autoload process simple.

See the implementation of this application structure on our example [Fastify Resty Blog](https://github.com/Fastify-Resty/fastify-resty/tree/main/examples/fastify-resty-blog) API.
