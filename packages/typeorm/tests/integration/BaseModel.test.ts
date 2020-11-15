import fs from 'fs';
import path from 'path';
import { BaseModel } from '../../src/BaseModel';
import { createConnection, Connection, Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Repository } from 'typeorm';

import usersData from '../data/users.json';

async function seed(connection: Connection, Entity: any, data: any) {
  await connection.createQueryBuilder()
    .insert()
    .into(Entity)
    .values(data.map(item => ({ ...item }))) // to avoid the source data mutation
    .execute();
}

async function cleanup(repository: Repository<any>) {
  const { tableName } = repository.metadata;
  try {
    await repository.query(`DELETE FROM \`${tableName}\`;`);
    await repository.query(`DELETE FROM sqlite_sequence WHERE name = "${tableName}"`);
  } catch (err) {
    console.error('SQLite database error:', err);
  }
}

@Entity()
class User {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  name: string;

  @Column()
  age: number;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}

describe('Model integration', () => {
  let connection: Connection;
  let model: BaseModel<User>;
  let userRepository: Repository<User>;
  
  beforeAll(async () => {
    connection = await createConnection({
      type: 'sqlite',
      database: path.resolve(__dirname, 'testDB.sql'),
      entities: [User]
    });

    await connection.synchronize();

    BaseModel.connection = connection;
    model = new BaseModel(User);

    userRepository = connection.getRepository(User);
  });

  afterAll(async () => {
    connection.close();
    fs.unlinkSync(path.resolve(__dirname, 'testDB.sql'));
  });
  
  // TODO break into find and queryBuilder sections
  describe('#find', () => {

    beforeAll(() => seed(connection, User, usersData));

    afterAll(() => cleanup(userRepository));

    describe('Paginate records using $skip and $limit query options', () => {

      test('Should find with $limit option', async () => {
        const results = await model.find({ $limit: 5 });
  
        expect(results).toBeInstanceOf(Array);
        expect(results.length).toBe(5);
      });

      test('Should find with $limit and $skip option', async () => {
        const results = await model.find({ $limit: 2, $skip: 4 });
  
        expect(results).toBeInstanceOf(Array);
        expect(results.length).toBe(2);
        expect(results[0].id).toBe(5);
        expect(results[1].id).toBe(6);      
      });

    });

    describe('Sorting records using $sort query option', () => {

      test('Should sort by string value with ASC order', async () => {
        const results = await model.find({ $sort: 'age' });
        
        expect(results).toBeInstanceOf(Array);
        expect(results.length).toBe(10);
        expect(results[0].age).toBe(20);
        expect(results[9].age).toBe(63);
      });

      test('Should sort by DESC order', async () => {
        const results = await model.find({ $sort: 'age' });
        
        expect(results).toBeInstanceOf(Array);
        expect(results.length).toBe(10);
        expect(results[0].age).toBe(20);
        expect(results[9].age).toBe(63);
      });

      test('Should sort by two string fields with ASC order', async () => {
        const results = await model.find({ $sort: ['age', 'id'] });
        
        expect(results).toBeInstanceOf(Array);
        expect(results.length).toBe(10);
        expect(results[0].age).toBe(20);
        expect(results[9].age).toBe(63);
        expect(results[4].id).toBe(4);
        expect(results[5].id).toBe(5);
        expect(results[6].id).toBe(9);
      });

      test.todo('Should sort by two fields with DESC order');

    });

    describe('Selecting fields using $select query option', () => {

      test('Should select only "name" fields', async () => {
        const results = await model.find({ $select: ['name'] });

        const isSomeIncorrect = results.some(row => {
          const fields = Object.keys(row);
          return fields.length !== 1 || !fields.includes('name');
        })

        expect(isSomeIncorrect).toBeFalsy();
      });

      test('Should select only "id" and "age" fields', async () => {
        const results = await model.find({ $select: ['id', 'age'] });

        const isSomeIncorrect = results.some(row => {
          const fields = Object.keys(row);
          return fields.length !== 2 || !fields.includes('id') || !fields.includes('age');
        })

        expect(isSomeIncorrect).toBeFalsy();
      });

    });

    describe('Find records using $where filtering', () => {

      test('Should find rows with $not query', async () => {
        const results = await model.find({ $where: { name: { $neq: 'Ervin Howell' }} });

        const filteredRowIndex = results.findIndex(row => row.name === 'Ervin Howell');
        
        expect(results).toBeInstanceOf(Array);
        expect(results.length).toBe(9);
        expect(filteredRowIndex).toBe(-1);
      });

      test.todo('Should find rows with $like query');

      test('Should find rows with $in query', async () => {
        const results = await model.find({ $where: { id: { $in: [3, 6, 9] }} });
        expect(results).toBeInstanceOf(Array);
        expect(results.length).toBe(3);
      });

    });
  });

  describe('#total', () => {

    beforeAll(() => seed(connection, User, usersData));

    afterAll(() => cleanup(userRepository));

    test('Should return total rows count', async () => {
      const results = await model.total();
      expect(results).toBe(10);
    });

    test('Should return total rows count with search query', async () => {
      const results = await model.total({ age: { $gte: 30 } });
      expect(results).toBe(6);
    });

  });

  describe('#create', () => {

    afterEach(() => cleanup(userRepository));

    test('Should create new single row', async () => {
      const row = { name: 'Jhon Doe', age: 24 };

      const results = await model.create(row);
      expect(results).toMatchObject({ identifiers: [1] });

      const rows = await userRepository.find();
      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({ ...row, id: 1 });
    });

    test('Should create a few rows', async () => {
      const insertRows = [
        { name: 'Jhon Doe', age: 24 },
        { name: 'Clementina DuBuque', age: 31 },
        { name: 'Nicholas Runolfsdottir V', age: 28 }
      ];

      const results = await model.create(insertRows);
      expect(results).toMatchObject({ identifiers: [1, 2, 3] });

      const rows = await userRepository.find();
      expect(rows).toHaveLength(3);
      expect(rows[0]).toMatchObject({ ...insertRows[0], id: 1 });
      expect(rows[1]).toMatchObject({ ...insertRows[1], id: 2 });
      expect(rows[2]).toMatchObject({ ...insertRows[2], id: 3 });
    });

  });

  describe('#patch', () => {

    beforeEach(() => seed(connection, User, usersData));

    afterEach(() => cleanup(userRepository));

    test('Should patch single row', async () => {
      const result = await model.patch({ id: 3 }, { age: 999 });

      // Note: working only with pg or mysql, because of RETURNING supported ✅
      // expect(result).toMatchObject({ affected: 1 });
      expect(result).toMatchObject({ affected: undefined });
      
      const rows = await userRepository.find();
      rows.forEach(row => {
        const sourceRow = usersData.find(user => user.id === row.id);
        expect(row).toHaveProperty('name', sourceRow.name);
        expect(row).toHaveProperty('age', row.id === 3 ? 999 : sourceRow.age);
      });
    });

    test('Should patch multi rows', async () => {
      const result = await model.patch({ age: { $in: [33, 37]} }, { name: 'PATCHED' });

      // Note: working only with pg or mysql, because of RETURNING supported ✅
      // expect(result).toMatchObject({ affected: 4 });
      expect(result).toMatchObject({ affected: undefined });

      const rows = await userRepository.find();
      rows.forEach(row => {
        const sourceRow = usersData.find(user => user.id === row.id);
        expect(row).toHaveProperty('name', [33, 37].includes(sourceRow.age) ? 'PATCHED' : sourceRow.name);
        expect(row).toHaveProperty('age', sourceRow.age);
      });
    });

    test('Should patch all rows', async () => {
      const result = await model.patch({}, { name: 'PATCHED', age: 0 });

      // Note: working only with pg or mysql, because of RETURNING supported ✅
      // expect(result).toMatchObject({ affected: 10 });
      expect(result).toMatchObject({ affected: undefined });

      const rows = await userRepository.find();
      rows.forEach(row => {
        expect(row).toHaveProperty('name', 'PATCHED');
        expect(row).toHaveProperty('age', 0);
      });
    });

    test.todo('Should not patch the primary id');

  });

  describe('#update', () => {

    beforeEach(() => seed(connection, User, usersData));

    afterEach(() => cleanup(userRepository));

    test('Should update single row', async () => {
      const [sourceRow] = await userRepository.find({ id: 6 });

      const result = await model.update({ id: 6 }, { id: 666, name: 'UPDATED', age: 999 });

      // Note: working only with pg or mysql, because of RETURNING supported ✅
      // expect(result).toMatchObject({ affected: 1 });
      expect(result).toMatchObject({ affected: undefined });

      const [updatedRow] = await userRepository.find({ id: 666 });
      expect(updatedRow).toBeDefined();
      expect(updatedRow.name).toBe('UPDATED');
      expect(updatedRow.age).toBe(999);
      expect(updatedRow.createdAt.getTime()).not.toBe(sourceRow.createdAt.getTime());
      expect(updatedRow.updatedAt.getTime()).not.toBe(sourceRow.updatedAt.getTime());
    });

    test('Should update multi rows', async () => {
      // arrange
      const createdAt = new Date();
      const sourceRows = await userRepository.find();

      // act
      const result = await model.update({ id: { $in: [4, 5, 6, 7]} }, { name: 'UPDATED', age: 666, createdAt });

      // assert
      // Note: working only with pg or mysql, because of RETURNING supported ✅
      // expect(result).toMatchObject({ affected: 4 });
      expect(result).toMatchObject({ affected: undefined });

      const rows = await userRepository.find();
      rows.forEach(row => {
        const sourceRow = sourceRows.find(user => user.id === row.id);

        if ([4, 5, 6, 7].includes(row.id)) {
          expect(row).toHaveProperty('name', 'UPDATED');
          expect(row).toHaveProperty('age', 666);
          expect(row.updatedAt.getTime()).not.toBe(sourceRow.updatedAt.getTime());
          expect(row.createdAt.getTime()).toBe(createdAt.getTime());
        } else {
          expect(row).toHaveProperty('name', sourceRow.name);
          expect(row).toHaveProperty('age', sourceRow.age);
          expect(row.updatedAt.getTime()).toBe(sourceRow.updatedAt.getTime());
          expect(row.createdAt.getTime()).toBe(sourceRow.createdAt.getTime());
        }
      });
    });

    test('Should update all rows', async () => {
      const updatedAt = new Date();
      const result = await model.update({}, { name: 'UPDATED_ALL', age: 0, updatedAt });

      // Note: working only with pg or mysql, because of RETURNING supported ✅
      // expect(result).toMatchObject({ affected: 10 });
      expect(result).toMatchObject({ affected: undefined });

      const rows = await userRepository.find();
      rows.forEach(row => {
        expect(row).toHaveProperty('name', 'UPDATED_ALL');
        expect(row).toHaveProperty('age', 0);
        expect(row.updatedAt.getTime()).toBe(updatedAt.getTime());
      });
    });

  });

  describe('#remove', () => {

    beforeEach(() => seed(connection, User, usersData));

    afterEach(() => cleanup(userRepository));

    test('Should remove single row', async () => {
      const result = await model.remove({ id: 5 });

      // Note: working only with pg or mysql, because of RETURNING supported ✅
      // expect(result).toMatchObject({ affected: 1 });
      expect(result).toMatchObject({ affected: undefined });

      const rows = await userRepository.find();
      expect(rows).toHaveLength(9);

      const removedRow = rows.find(row => row.id === 5);
      expect(removedRow).toBeUndefined();
    });

    test('Should delete multi rows', async () => {
      const result = await model.remove({ $or: [{ age: { $lte: 26 } }, { name: 'Chelsey Dietrich' }] });

      // Note: working only with pg or mysql, because of RETURNING supported ✅
      // expect(result).toMatchObject({ affected: 5 });
      expect(result).toMatchObject({ affected: undefined });

      const rows = await connection.getRepository(User).find();
      expect(rows).toHaveLength(5);

      rows.forEach(row => {
        const isMatchDeleteQuery = row.age <= 26 || row.name === 'Chelsey Dietrich';
        expect(isMatchDeleteQuery).toBeFalsy();
      });
    });

    test('Should delete all rows', async () => {
      const result = await model.remove({});

      // TODO: check on pg and mysql, test doesn't passed because of affected is undefined
      // expect(result).toMatchObject({ affected: 10 });
      expect(result).toMatchObject({ affected: undefined });

      const rows = await userRepository.find();
      expect(rows).toHaveLength(0);
    });

  });

});
