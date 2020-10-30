export const find   = jest.fn();
export const total  = jest.fn();
export const create = jest.fn();
export const patch  = jest.fn();
export const update = jest.fn();
export const remove = jest.fn();

export default jest.fn().mockImplementation((EntityClass) => {
  return {
    get name() {
      return EntityClass.name;
    },
    jsonSchema: {
      id: { type: 'number', _options: { generated: true } },
      name: { type: 'string' }
    },
    find,
    total,
    create,
    patch,
    update,
    remove
  };
});
