import entityMethods from '../../../../src/decorators/entityController/methods';

describe('EntityController base methods', () => {
  let controllerContext;
  const mocks: Record<string, jest.Mock> = {}; 

  beforeAll(() => {
    controllerContext = {
      model: {
        name: 'Entity',
        find: mocks.modelFind = jest.fn()
      },
      config: { id: 'id' }
    };
  });

  afterEach(() => {
    Object.values(mocks).forEach(mock => mock.mockReset());
  });

  describe('#findOne', () => {

    test('Should handle 404 (NotFound) error', async () => {
      mocks.modelFind.mockResolvedValue([]);

      try {
        await entityMethods.findOne.call(controllerContext, ({ params: { id: 1 } } as any));
        expect(false).toBeTruthy();
      } catch (error) {
        expect(error.message).toBe('Entity #1 is not found');
        expect(error.statusCode).toBe(404);
        expect(mocks.modelFind.mock.calls.length).toBe(1);
        expect(mocks.modelFind.mock.calls[0][0]).toMatchObject({ $where: { id: 1 } });
      }
    });

  });
});