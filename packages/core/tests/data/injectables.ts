import { Inject } from '../../src/decorators/inject';
import { Service } from '../../src/decorators/service';
import { Controller } from '../../src/decorators/controller';
import { EntityController } from '../../src/decorators/entityController';
import { Model } from '../../src/decorators/model';
import { FastifyToken } from '../../src/symbols';
import { IBaseModel } from '../../dist';

const TantoToken = Symbol('TantoToken');
const NunchakuToken = Symbol('NunchakuToken');

export const FastifyDecorated = Symbol('FastifyDecorated');

/****** Injectables ******/

@Service()
export class Katana {
  hit() { return 'cut!'; }
}

@Service()
export class Shuriken {
  cast() { return 'wjuuuh'; }
}

@Service()
export class Naginata {
  size = 'large';
}

@Service('Wakizashi')
export class Wakizashi {
  fight() { return 'bang' };
}

@Service(TantoToken)
export class Tanto {
  use() { return 'battle!' }
}

@Service(NunchakuToken)
export class Nunchaku {
  brandish() { return 'wjuuuh-wjuuuh-wjuuuh'; };
}

export class BackpackEntity {}

/****** Injectable ******/

@Controller()
export class Samurai {
  constructor(
    public katana: Katana,
    @Inject('schema') schema,
    @Inject() naginata: Naginata,
    @Inject(NunchakuToken) nunchaku,
    @Model(BackpackEntity) backpackModel
  ) {
    this.schema = schema;
    this.naginata = naginata;
    this.nunchaku = nunchaku;
    this.backpackModel = backpackModel;
  }

  schema: any;
  naginata: Naginata;
  nunchaku: Nunchaku;
  backpackModel: IBaseModel<BackpackEntity>;

  @Inject()
  shuriken: Shuriken;

  @Inject()
  static shuriken: Shuriken;

  @Inject('steel')
  steel: string;

  @Inject('steel')
  static steel: string;

  @Inject('Wakizashi')
  wakizashi: { fight: () => string };

  @Inject('Wakizashi')
  static wakizashi: { fight: () => string };

  @Inject(FastifyToken)
  fastifyInstance;

  @Inject(TantoToken)
  tanto: { use: () => string }

  @Inject(TantoToken)
  static tanto: { use: () => string }

  @Inject(FastifyDecorated)
  fastifyDecorated: string;

  @Model(BackpackEntity)
  backpack: IBaseModel<BackpackEntity>;

  @Model(BackpackEntity)
  static backpack: IBaseModel<BackpackEntity>;
}

@EntityController({})
export class Ninja {
  constructor(
    public katana: Katana,
    @Inject('schema') schema,
    @Inject() naginata: Naginata,
    @Inject(NunchakuToken) nunchaku,
    @Model(BackpackEntity) backpackModel
  ) {
    this.schema = schema;
    this.naginata = naginata;
    this.nunchaku = nunchaku;
    this.backpackModel = backpackModel;
  }

  schema: any;
  naginata: Naginata;
  nunchaku: Nunchaku;
  backpackModel: IBaseModel<BackpackEntity>;

  @Inject()
  shuriken: Shuriken;

  @Inject()
  static shuriken: Shuriken;

  @Inject('steel')
  steel: string;

  @Inject('steel')
  static steel: string;

  @Inject('Wakizashi')
  wakizashi: { fight: () => string };

  @Inject('Wakizashi')
  static wakizashi: { fight: () => string };

  @Inject(FastifyToken)
  fastifyInstance;

  @Inject(TantoToken)
  tanto: { use: () => string }

  @Inject(TantoToken)
  static tanto: { use: () => string }

  @Inject(FastifyDecorated)
  fastifyDecorated: string;

  @Model(BackpackEntity)
  backpack: IBaseModel<BackpackEntity>;

  @Model(BackpackEntity)
  static backpack: IBaseModel<BackpackEntity>;
}

@Service()
export class Weapon {
  constructor(
    public katana: Katana,
    @Inject('schema') schema,
    @Inject() naginata: Naginata,
    @Inject(NunchakuToken) nunchaku,
    @Model(BackpackEntity) backpackModel
  ) {
    this.schema = schema;
    this.naginata = naginata;
    this.nunchaku = nunchaku;
    this.backpackModel = backpackModel;
  }

  schema: any;
  naginata: Naginata;
  nunchaku: Nunchaku;
  backpackModel: IBaseModel<BackpackEntity>;

  @Inject()
  shuriken: Shuriken;

  @Inject()
  static shuriken: Shuriken;

  @Inject('steel')
  steel: string;

  @Inject('steel')
  static steel: string;

  @Inject('Wakizashi')
  wakizashi: { fight: () => string };

  @Inject('Wakizashi')
  static wakizashi: { fight: () => string };

  @Inject(FastifyToken)
  fastifyInstance;

  @Inject(TantoToken)
  tanto: { use: () => string }

  @Inject(TantoToken)
  static tanto: { use: () => string }

  @Inject(FastifyDecorated)
  fastifyDecorated: string;

  @Model(BackpackEntity)
  backpack: IBaseModel<BackpackEntity>;

  @Model(BackpackEntity)
  static backpack: IBaseModel<BackpackEntity>;
}
