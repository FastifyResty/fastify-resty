import Injector from '../../src/injector';
import { FastifyToken } from '../../src/symbols';
import { Samurai, Ninja, Weapon, Katana, Shuriken, Naginata, Nunchaku, Tanto, Wakizashi, FastifyDecorated } from '../data/injectables';
import type { FastifyInstance } from 'fastify';

class BaseModel {}

describe('Injector', () => {

  let injector: Injector;
  const fastifyInstance: FastifyInstance = {
    schema: { id: { type: 'number' } },
    steel: 'real steel',
    [FastifyDecorated]: 'FastifyDecoratedValue',
    BaseModel
  } as any;

  beforeEach(() => {
    injector = new Injector();
    injector.registerInstance(FastifyToken, fastifyInstance);
  });

  it('Should use singleton instances', () => {
    const samuraiFirst = injector.getInstance(Samurai);
    const samuraiSecond = injector.getInstance(Samurai);
    expect(samuraiFirst).toBe(samuraiSecond);

    // Compare injects of two same class instances
    expect(samuraiFirst.katana).toBe(samuraiSecond.katana);
    expect(samuraiFirst.shuriken).toBe(samuraiSecond.shuriken);
    expect(samuraiFirst.naginata).toBe(samuraiSecond.naginata);
    expect(samuraiFirst.nunchaku).toBe(samuraiSecond.nunchaku);
    expect(samuraiFirst.tanto).toBe(samuraiSecond.tanto);
    expect(samuraiFirst.wakizashi).toBe(samuraiSecond.wakizashi);
    expect(samuraiFirst.fastifyInstance).toBe(samuraiSecond.fastifyInstance);

    // Compare injects of instance and static class property
    expect(samuraiFirst.shuriken).toBe(Samurai.shuriken);
    expect(samuraiFirst.shuriken).toBe(Samurai.shuriken);
    expect(samuraiFirst.wakizashi).toBe(Samurai.wakizashi);
    expect(samuraiFirst.wakizashi).toBe(Samurai.wakizashi);
    expect(samuraiFirst.tanto).toBe(Samurai.tanto);
    expect(samuraiFirst.tanto).toBe(Samurai.tanto);

    // Compare injects of instances and newly resolved instances
    const katana = injector.getInstance(Katana);
    expect(samuraiFirst.katana).toBe(katana);
    expect(samuraiSecond.katana).toBe(katana);

    const shuriken = injector.getInstance(Shuriken);
    expect(samuraiFirst.shuriken).toBe(shuriken);
    expect(samuraiSecond.shuriken).toBe(shuriken);

    const naginata = injector.getInstance(Naginata);
    expect(samuraiFirst.naginata).toBe(naginata);
    expect(samuraiSecond.naginata).toBe(naginata);

    const nunchaku = injector.getInstance(Nunchaku);
    expect(samuraiFirst.nunchaku).toBe(nunchaku);
    expect(samuraiSecond.nunchaku).toBe(nunchaku);

    const tanto = injector.getInstance(Tanto);
    expect(samuraiFirst.tanto).toBe(tanto);
    expect(samuraiSecond.tanto).toBe(tanto);

    const wakizashi = injector.getInstance(Wakizashi);
    expect(samuraiFirst.wakizashi).toBe(wakizashi);
    expect(samuraiSecond.wakizashi).toBe(wakizashi);
  });

  describe('Resolve instance by type', () => {

    it('Should inject constructor parameter by type', () => {
      // @Controller
      const samurai = injector.getInstance(Samurai);
      expect(samurai.katana).toBeDefined();
      expect(samurai.katana.hit).toBeDefined();

      // @EntityController
      const ninja = injector.getInstance(Ninja);
      expect(ninja.katana).toBeDefined();
      expect(ninja.katana.hit).toBeDefined();

      // @Service
      const weapon = injector.getInstance(Weapon);
      expect(weapon.katana).toBeDefined();
      expect(weapon.katana.hit).toBeDefined();
    });

    it('Should inject class property by type', () => {
      // @Controller
      const samurai = injector.getInstance(Samurai);
      expect(samurai.shuriken).toBeDefined();
      expect(samurai.shuriken.cast).toBeDefined();

      // @EntityController
      const ninja = injector.getInstance(Ninja);
      expect(ninja.shuriken).toBeDefined();
      expect(ninja.shuriken.cast).toBeDefined();

      // @Service
      const weapon = injector.getInstance(Weapon);
      expect(weapon.shuriken).toBeDefined();
      expect(weapon.shuriken.cast).toBeDefined();
    });

    it('Should inject class static property by type', () => {
      // @Controller
      injector.getInstance(Samurai);
      expect(Samurai.shuriken).toBeDefined();
      expect(Samurai.shuriken.cast).toBeDefined();

      // @EntityController
      injector.getInstance(Ninja);
      expect(Ninja.shuriken).toBeDefined();
      expect(Ninja.shuriken.cast).toBeDefined();

      // @Service
      injector.getInstance(Weapon);
      expect(Weapon.shuriken).toBeDefined();
      expect(Weapon.shuriken.cast).toBeDefined();
    });

    it('Should ignore empty token if type is defined', () => {
      // @Controller
      const samurai = injector.getInstance(Samurai);
      expect(samurai.naginata).toBeDefined();
      expect(samurai.naginata.size).toBeDefined();

      // @EntityController
      const ninja = injector.getInstance(Ninja);
      expect(ninja.naginata).toBeDefined();
      expect(ninja.naginata.size).toBeDefined();

       // @Service
       const weapon = injector.getInstance(Weapon);
       expect(weapon.naginata).toBeDefined();
       expect(weapon.naginata.size).toBeDefined();
    });

  });

  describe('Resolve instance by token', () => {

    describe('String token', () => {

      it('Should inject constructor parameter by string token', () => {
        // @Controller
        const samurai = injector.getInstance(Samurai);
        expect(samurai.schema).toBeDefined();
        expect(samurai.schema).toEqual((fastifyInstance as any).schema);
  
        // @EntityController
        const ninja = injector.getInstance(Ninja);
        expect(ninja.schema).toBeDefined();
        expect(ninja.schema).toEqual((fastifyInstance as any).schema);
  
        // @Service
        const weapon = injector.getInstance(Weapon);
        expect(weapon.schema).toBeDefined();
        expect(weapon.schema).toEqual((fastifyInstance as any).schema);
      });
  
      it('Should inject decorated value into class property by string token', () => {
        // @Controller
        const samurai = injector.getInstance(Samurai);
        expect(samurai.steel).toBeDefined();
        expect(samurai.steel).toBe('real steel');
  
        // @EntityController
        const ninja = injector.getInstance(Ninja);
        expect(ninja.steel).toBeDefined();
        expect(ninja.steel).toBe('real steel');
  
        // @Service
        const weapon = injector.getInstance(Weapon);
        expect(weapon.steel).toBeDefined();
        expect(weapon.steel).toBe('real steel');
      });
  
      it('Should inject decorated value into class static property by string token', () => {
        // @Controller
        injector.getInstance(Samurai);
        expect(Samurai.steel).toBeDefined();
        expect(Samurai.steel).toBe('real steel');
  
        // @EntityController
        injector.getInstance(Ninja);
        expect(Ninja.steel).toBeDefined();
        expect(Ninja.steel).toBe('real steel');
  
        // @Service
        injector.getInstance(Weapon);
        expect(Weapon.steel).toBeDefined();
        expect(Weapon.steel).toBe('real steel');
      });
  
      it('Should inject Service into class property by string token', () => {
        // @Controller
        const samurai = injector.getInstance(Samurai);
        expect(samurai.wakizashi).toBeDefined();
        expect(samurai.wakizashi.fight).toBeDefined();
  
        // @EntityController
        const ninja = injector.getInstance(Ninja);
        expect(ninja.wakizashi).toBeDefined();
        expect(ninja.wakizashi.fight).toBeDefined();
  
        // @Service
        const weapon = injector.getInstance(Weapon);
        expect(weapon.wakizashi).toBeDefined();
        expect(weapon.wakizashi.fight).toBeDefined();
      });
  
      it('Should inject Service into class static property by string token', () => {
        // @Controller
        injector.getInstance(Samurai);
        expect(Samurai.wakizashi).toBeDefined();
        expect(Samurai.wakizashi.fight).toBeDefined();
  
        // @EntityController
        injector.getInstance(Ninja);
        expect(Ninja.wakizashi).toBeDefined();
        expect(Ninja.wakizashi.fight).toBeDefined();
  
        // @Service
        injector.getInstance(Weapon);
        expect(Weapon.wakizashi).toBeDefined();
        expect(Weapon.wakizashi.fight).toBeDefined();
      });
  
    });

    describe('Symbol token', () => {

      it('Should inject Fastify instance by token', () => {
        // @Controller
        const samurai = injector.getInstance(Samurai);
        expect(samurai.fastifyInstance).toBeDefined();
  
        // @EntityController
        const ninja = injector.getInstance(Ninja);
        expect(ninja.fastifyInstance).toBeDefined();
  
        // @Service
        const weapon = injector.getInstance(Weapon);
        expect(weapon.fastifyInstance).toBeDefined();
      });

      it('Should inject Fastify decorated symbol by token', () => {
        // @Controller
        const samurai = injector.getInstance(Samurai);
        expect(samurai.fastifyDecorated).toBe('FastifyDecoratedValue');
  
        // @EntityController
        const ninja = injector.getInstance(Ninja);
        expect(ninja.fastifyDecorated).toBe('FastifyDecoratedValue');
  
        // @Service
        const weapon = injector.getInstance(Weapon);
        expect(weapon.fastifyDecorated).toBe('FastifyDecoratedValue');
      });

      it('Should inject Service into class property by Symbol token', () => {
        // @Controller
        const samurai = injector.getInstance(Samurai);
        expect(samurai.tanto).toBeDefined();
        expect(samurai.tanto.use).toBeDefined();
  
        // @EntityController
        const ninja = injector.getInstance(Ninja);
        expect(ninja.tanto).toBeDefined();
        expect(ninja.tanto.use).toBeDefined();

        // @Service
        const weapon = injector.getInstance(Weapon);
        expect(weapon.tanto).toBeDefined();
        expect(weapon.tanto.use).toBeDefined();
      });
  
      it('Should inject Service into class static property by Symbol token', () => {
         // @Controller
         injector.getInstance(Samurai);
         expect(Samurai.tanto).toBeDefined();
         expect(Samurai.tanto.use).toBeDefined();
   
         // @EntityController
         injector.getInstance(Ninja);
         expect(Ninja.tanto).toBeDefined();
         expect(Ninja.tanto.use).toBeDefined();
   
         // @Service
         injector.getInstance(Weapon);
         expect(Weapon.tanto).toBeDefined();
         expect(Weapon.tanto.use).toBeDefined();
      });

      it('Should inject Service into constructor by Symbol token', () => {
        // @Controller
        const samurai = injector.getInstance(Samurai);
        expect(samurai.nunchaku).toBeDefined();
        expect(samurai.nunchaku.brandish).toBeDefined();

        // @EntityController
        const ninja = injector.getInstance(Ninja);
        expect(ninja.nunchaku).toBeDefined();
        expect(ninja.nunchaku.brandish).toBeDefined();

        // @Service
        const weapon = injector.getInstance(Weapon);
        expect(weapon.nunchaku).toBeDefined();
        expect(weapon.nunchaku.brandish).toBeDefined();
      });

    });

  });

  describe('Construct injected model', () => {

    it('Should construct model from constructor parameter', () => {
      // @Controller
      const samurai = injector.getInstance(Samurai);
      expect(samurai.backpackModel).toBeDefined();
      expect(samurai.backpackModel).toBeInstanceOf(BaseModel);

      // @EntityController
      const ninja = injector.getInstance(Ninja);
      expect(ninja.backpackModel).toBeDefined();
      expect(ninja.backpackModel).toBeInstanceOf(BaseModel);

      // @Service
      const weapon = injector.getInstance(Weapon);
      expect(weapon.backpackModel).toBeDefined();
      expect(weapon.backpackModel).toBeInstanceOf(BaseModel);
    });

    it('Should construct model from class property', () => {
      // @Controller
      const samurai = injector.getInstance(Samurai);
      expect(samurai.backpack).toBeDefined();
      expect(samurai.backpack).toBeInstanceOf(BaseModel);

      // @EntityController
      const ninja = injector.getInstance(Ninja);
      expect(ninja.backpack).toBeDefined();
      expect(ninja.backpack).toBeInstanceOf(BaseModel);

      // @Service
      const weapon = injector.getInstance(Weapon);
      expect(weapon.backpack).toBeDefined();
      expect(weapon.backpack).toBeInstanceOf(BaseModel);
    });

    it('Should construct model from class static property', () => {
      // @Controller
      injector.getInstance(Samurai);
      expect(Samurai.backpack).toBeDefined();
      expect(Samurai.backpack).toBeInstanceOf(BaseModel);

      // @EntityController
      injector.getInstance(Ninja);
      expect(Ninja.backpack).toBeDefined();
      expect(Ninja.backpack).toBeInstanceOf(BaseModel);

      // @Service
      injector.getInstance(Weapon);
      expect(Weapon.backpack).toBeDefined();
      expect(Weapon.backpack).toBeInstanceOf(BaseModel);
    });

    it('Should construct different instances of same Entity', () => {
      const samurai = injector.getInstance(Samurai);
      expect(samurai.backpackModel).not.toBe(samurai.backpack);
      expect(samurai.backpack).not.toBe(Samurai.backpack);

      const ninja = injector.getInstance(Ninja);
      expect(ninja.backpackModel).not.toBe(ninja.backpack);
      expect(ninja.backpack).not.toBe(Ninja.backpack);

      const weapon = injector.getInstance(Weapon);
      expect(weapon.backpackModel).not.toBe(weapon.backpack);
      expect(weapon.backpack).not.toBe(Weapon.backpack);

      expect(samurai.backpackModel).not.toBe(ninja.backpackModel);
      expect(ninja.backpackModel).not.toBe(weapon.backpackModel);

      expect(samurai.backpack).not.toBe(ninja.backpack);
      expect(ninja.backpack).not.toBe(weapon.backpack);

      expect(Samurai.backpack).not.toBe(Ninja.backpack);
      expect(Ninja.backpack).not.toBe(Weapon.backpack);
    });

  });

});
