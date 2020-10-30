export default {
  get: {
    schema: {
      querystring: {
        $limit: { type: 'number' },
        $results: { type: 'boolean' },
      },
      params: {
        id: { type: 'number' },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  title: { type: 'string' },
                },
              },
            },
            total: { type: 'number' },
          },
        },
      },
    },
    response: {
      data: [
        { id: 1, title: 'Sample 1' },
        { id: 2, title: 'Second Sample' },
      ],
      total: 2,
      limit: 20,
      skip: 0,
    },
  },
  post: {
    response: {
      id: 1,
      createdAt: new Date(),
    },
    body: {
      id: 1,
    },
    schema: {
      query: {
        $results: { type: 'boolean' },
      },
      body: {
        id: { type: 'number' },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            createdAt: {
              type: 'string',
            },
          },
        },
      },
    },
  },
  patch: {
    response: {
      affected: 1,
    },
    body: {
      title: 'Sample data title',
      draft: true,
    },
    schema: {
      querystring: {
        times: { type: 'number' },
      },
      params: {
        ref: { type: 'string' },
      },
      body: {
        title: { type: 'string' },
        draft: { type: 'boolean' },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            affected: { type: 'number' },
          },
        },
      },
    },
  },
};
