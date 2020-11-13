import Injector from '../../src/injector';
import { FastifyToken } from '../../src/symbols';
import { Samurai, Ninja, Backpack, Weapon, Katana, Shuriken, Naginata, Nunchaku, Tanto, Wakizashi, FastifyDecorated } from '../data/injectables';
import type { FastifyInstance } from 'fastify';


describe('Injector', () => {

  let injector: Injector;
  const fastifyInstance: FastifyInstance = {
    schema: { id: { type: 'number' } },
    steel: 'real steel',
    [FastifyDecorated]: 'FastifyDecoratedValue'
  } as any;

  beforeEach(() => {
    injector = new Injector();
    injector.registerInstance(FastifyToken, fastifyInstance);
  });

  it('Should use singleton instances', () => {
    // Compare injects of two same class instances
    const backpackFirst = injector.getInstance(Backpack);
    const backpackSecond = injector.getInstance(Backpack);
    expect(backpackFirst).toBe(backpackSecond);
    expect(backpackFirst.katana).toBe(backpackSecond.katana);
    expect(backpackFirst.shuriken).toBe(backpackSecond.shuriken);
    expect(backpackFirst.naginata).toBe(backpackSecond.naginata);
    expect(backpackFirst.nunchaku).toBe(backpackSecond.nunchaku);
    expect(backpackFirst.tanto).toBe(backpackSecond.tanto);
    expect(backpackFirst.wakizashi).toBe(backpackSecond.wakizashi);
    expect(backpackFirst.fastifyInstance).toBe(backpackSecond.fastifyInstance);

    // Compare injects of instance and static class property
    expect(backpackFirst.shuriken).toBe(Backpack.shuriken);
    expect(backpackSecond.shuriken).toBe(Backpack.shuriken);
    expect(backpackFirst.wakizashi).toBe(Backpack.wakizashi);
    expect(backpackSecond.wakizashi).toBe(Backpack.wakizashi);
    expect(backpackFirst.tanto).toBe(Backpack.tanto);
    expect(backpackSecond.tanto).toBe(Backpack.tanto);

    // Compare injects of instances and newly resolved instances
    const katana = injector.getInstance(Katana);
    expect(backpackFirst.katana).toBe(katana);
    expect(backpackSecond.katana).toBe(katana);

    const shuriken = injector.getInstance(Shuriken);
    expect(backpackFirst.shuriken).toBe(shuriken);
    expect(backpackSecond.shuriken).toBe(shuriken);

    const naginata = injector.getInstance(Naginata);
    expect(backpackFirst.naginata).toBe(naginata);
    expect(backpackSecond.naginata).toBe(naginata);

    const nunchaku = injector.getInstance(Nunchaku);
    expect(backpackFirst.nunchaku).toBe(nunchaku);
    expect(backpackSecond.nunchaku).toBe(nunchaku);

    const tanto = injector.getInstance(Tanto);
    expect(backpackFirst.tanto).toBe(tanto);
    expect(backpackSecond.tanto).toBe(tanto);

    const wakizashi = injector.getInstance(Wakizashi);
    expect(backpackFirst.wakizashi).toBe(wakizashi);
    expect(backpackSecond.wakizashi).toBe(wakizashi);
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
      const backpack = injector.getInstance(Backpack);
      expect(backpack.katana).toBeDefined();
      expect(backpack.katana.hit).toBeDefined();

      // @Model
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
      const backpack = injector.getInstance(Backpack);
      expect(backpack.shuriken).toBeDefined();
      expect(backpack.shuriken.cast).toBeDefined();

      // @Model
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
      injector.getInstance(Backpack);
      expect(Backpack.shuriken).toBeDefined();
      expect(Backpack.shuriken.cast).toBeDefined();

      // @Model
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
      const backpack = injector.getInstance(Backpack);
      expect(backpack.naginata).toBeDefined();
      expect(backpack.naginata.size).toBeDefined();

       // @Model
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
        const backpack = injector.getInstance(Backpack);
        expect(backpack.schema).toBeDefined();
        expect(backpack.schema).toEqual((fastifyInstance as any).schema);
  
        // @Model
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
        const backpack = injector.getInstance(Backpack);
        expect(backpack.steel).toBeDefined();
        expect(backpack.steel).toBe('real steel');
  
        // @Model
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
        injector.getInstance(Backpack);
        expect(Backpack.steel).toBeDefined();
        expect(Backpack.steel).toBe('real steel');
  
        // @Model
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
        const backpack = injector.getInstance(Backpack);
        expect(backpack.wakizashi).toBeDefined();
        expect(backpack.wakizashi.fight).toBeDefined();
  
        // @Model
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
        injector.getInstance(Backpack);
        expect(Backpack.wakizashi).toBeDefined();
        expect(Backpack.wakizashi.fight).toBeDefined();
  
        // @Model
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
        const backpack = injector.getInstance(Backpack);
        expect(backpack.fastifyInstance).toBeDefined();
  
        // @Model
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
        const backpack = injector.getInstance(Backpack);
        expect(backpack.fastifyDecorated).toBe('FastifyDecoratedValue');
  
        // @Model
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
        const backpack = injector.getInstance(Backpack);
        expect(backpack.tanto).toBeDefined();
        expect(backpack.tanto.use).toBeDefined();
  
        // @Model
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
         injector.getInstance(Backpack);
         expect(Backpack.tanto).toBeDefined();
         expect(Backpack.tanto.use).toBeDefined();
   
         // @Model
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
        const backpack = injector.getInstance(Backpack);
        expect(backpack.nunchaku).toBeDefined();
        expect(backpack.nunchaku.brandish).toBeDefined();

        // @Model
        const weapon = injector.getInstance(Weapon);
        expect(weapon.nunchaku).toBeDefined();
        expect(weapon.nunchaku.brandish).toBeDefined();
      });

    });

  });

});
