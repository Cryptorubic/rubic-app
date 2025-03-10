import { ON_CHAIN_TRADE_TYPE, OnChainTradeType } from 'rubic-sdk';
import { ProviderInfo } from '@features/trade/models/provider-info';

const imageBasePath = 'assets/images/icons/providers/on-chain/';

const onChainTradeProviders: Record<OnChainTradeType, ProviderInfo> = {
  [ON_CHAIN_TRADE_TYPE['10K_SWAP']]: {
    name: '10KSwap',
    image: `${imageBasePath}10Kswap.png`,
    color: '#03fc84'
  },
  //AAAAAAAAAAAAAAAAAAAAA
  [ON_CHAIN_TRADE_TYPE.ACRYPTOS]: {
    name: 'Acryptos',
    image: `${imageBasePath}acryptos.png`,
    color: '#FF0A1C'
  },
  [ON_CHAIN_TRADE_TYPE.AERODROME]: {
    name: 'Aerodrome',
    image: `${imageBasePath}aerodrome.png`,
    color: '#2A54F3'
  },
  [ON_CHAIN_TRADE_TYPE.ALDRIN_EXCHANGE]: {
    name: 'AldrinExchange',
    image: `${imageBasePath}aldrin.svg`,
    color: '#383838'
  },
  [ON_CHAIN_TRADE_TYPE.ALGEBRA]: {
    name: 'Algebra',
    image: `${imageBasePath}algebra.svg`,
    color: '#00CAB2'
  },
  [ON_CHAIN_TRADE_TYPE.ALGEBRA_INTEGRAL]: {
    name: 'Algebra',
    image: `${imageBasePath}algebra.svg`,
    color: '#00CAB2'
  },
  [ON_CHAIN_TRADE_TYPE.ANNEX]: {
    name: 'Annex',
    image: `${imageBasePath}annex.webp`,
    color: '#FFAD4F'
  },
  [ON_CHAIN_TRADE_TYPE.APE_SWAP]: {
    name: 'Acryptos',
    image: `${imageBasePath}ape.svg`,
    color: '#A16552'
  },
  [ON_CHAIN_TRADE_TYPE.ARTH_SWAP]: {
    name: 'ArthSwap',
    image: `${imageBasePath}arth.png`,
    color: '#00C6EE'
  },
  [ON_CHAIN_TRADE_TYPE.ASCENT]: {
    name: 'Ascent',
    image: `${imageBasePath}ascent.svg`,
    color: '#1aa96b'
  },
  [ON_CHAIN_TRADE_TYPE.ASTRO_SWAP]: {
    name: 'AstroSwap',
    image: `${imageBasePath}astroswap.png`,
    color: '#adaaaa'
  },
  [ON_CHAIN_TRADE_TYPE.AURORA_SWAP]: {
    name: 'AuroraSwap',
    image: `${imageBasePath}auroraswap.svg`,
    color: '#34A5F5'
  },
  [ON_CHAIN_TRADE_TYPE.AVNU]: {
    name: 'Avnu',
    image: `${imageBasePath}avnu.png`,
    color: 'white'
  },

  //BBBBBBBBBBBBBBBBBBBBB
  [ON_CHAIN_TRADE_TYPE.BABY_SWAP]: {
    name: 'BabySwap',
    image: `${imageBasePath}babyswap.svg`,
    color: '#E89B37'
  },
  [ON_CHAIN_TRADE_TYPE.BALANCER]: {
    name: 'Balancer',
    image: `${imageBasePath}balancer.svg`,
    color: 'white'
  },
  [ON_CHAIN_TRADE_TYPE.BASE_SWAP]: {
    name: 'BaseSwap',
    image: `${imageBasePath}baseswap.png`,
    color: '#000DBF'
  },
  [ON_CHAIN_TRADE_TYPE.BEAM_SWAP]: {
    name: 'BeamSwap',
    image: `${imageBasePath}beamswap.png`,
    color: '#26B7F0'
  },
  [ON_CHAIN_TRADE_TYPE.BI_SWAP]: {
    name: 'BiSwap',
    image: `${imageBasePath}biswap.svg`,
    color: '#EE3652'
  },
  [ON_CHAIN_TRADE_TYPE.BRIDGERS]: {
    name: 'Bridgers',
    image: `${imageBasePath}../bridge/bridgers.png`,
    color: 'white'
  },
  [ON_CHAIN_TRADE_TYPE.BLAZE_SWAP]: {
    name: 'Blaze Swap',
    image: `${imageBasePath}blazeswap.svg`,
    color: '#FFAF1D'
  },

  //CCCCCCCCCCCCCCCCCCCC
  [ON_CHAIN_TRADE_TYPE.CAMELOT]: {
    name: 'Camelot',
    image: `${imageBasePath}camelot.png`,
    color: '#FFAF1D'
  },
  [ON_CHAIN_TRADE_TYPE.CHERRY_SWAP]: {
    name: 'Cherry Swap',
    image: `${imageBasePath}cherryswap.svg`,
    color: 'pink'
  },
  [ON_CHAIN_TRADE_TYPE.CLAIM_SWAP]: {
    name: 'ClaimSwap',
    image: `${imageBasePath}claimswap.svg`,
    color: '#181E6A'
  },
  [ON_CHAIN_TRADE_TYPE.COFFEE_SWAP]: {
    name: 'CoffeeSwap',
    image: `${imageBasePath}coffee-swap.png`,
    color: '#181E6A'
  },
  [ON_CHAIN_TRADE_TYPE.CREMA_FINANCE]: {
    name: 'CremaFinance',
    image: `${imageBasePath}cremafinance.ico`,
    color: '#6AE2DC'
  },
  [ON_CHAIN_TRADE_TYPE.CRO_SWAP]: {
    name: 'CroSwap',
    image: `${imageBasePath}croswap.svg`,
    color: '#020426'
  },
  [ON_CHAIN_TRADE_TYPE.CRONA_SWAP]: {
    name: 'CronaSwap',
    image: `${imageBasePath}cronaswap.webp`,
    color: '#020426'
  },
  [ON_CHAIN_TRADE_TYPE.CROPPER_FINANCE]: {
    name: 'CropperFinance',
    image: `${imageBasePath}cropperfinance.ico`,
    color: '#9B5FE3'
  },
  [ON_CHAIN_TRADE_TYPE.CROW_FI]: {
    name: 'CrowFi',
    image: `${imageBasePath}crowfi.png`,
    color: '#0D3D49'
  },
  [ON_CHAIN_TRADE_TYPE.CRO_DEX]: {
    name: 'CroDex',
    image: `${imageBasePath}crodex.png`,
    color: '#F05A28'
  },
  [ON_CHAIN_TRADE_TYPE.CURVE]: {
    name: 'Curve',
    image: `${imageBasePath}curve.svg`,
    color: '#19E0CE'
  },

  //EEEEEEEEEEEEEEEEEEEE
  [ON_CHAIN_TRADE_TYPE.EDDY_FINANCE]: {
    name: 'Eddy Finance',
    image: `${imageBasePath}eddyfinance.ico`,
    color: 'black'
  },
  [ON_CHAIN_TRADE_TYPE.ECHO_DEX]: {
    name: 'Echo',
    image: `${imageBasePath}ecodex.svg`,
    color: 'white'
  },
  [ON_CHAIN_TRADE_TYPE.ELK]: {
    name: 'Elk',
    image: `${imageBasePath}elk.png`,
    color: '#009A5C'
  },
  [ON_CHAIN_TRADE_TYPE.ENOSYS]: {
    name: 'Enosys',
    image: `${imageBasePath}enosys.svg`,
    color: '#000000'
  },
  [ON_CHAIN_TRADE_TYPE.ENOSYS_V3]: {
    name: 'Enosys V3',
    image: `${imageBasePath}enosys.svg`,
    color: '#000000'
  },

  //DDDDDDDDDDDDDDDDDDDDD
  [ON_CHAIN_TRADE_TYPE.DEDUST]: {
    name: 'Dedust',
    image: `${imageBasePath}dedust.svg`,
    color: '#ebab34',
    averageTime: 5
  },
  [ON_CHAIN_TRADE_TYPE.DEFI_PLAZA]: {
    name: 'DefiPlaza',
    image: `${imageBasePath}defiplaza.png`,
    color: '#5D10C0'
  },
  [ON_CHAIN_TRADE_TYPE.DEFI_SWAP]: {
    name: 'DefiSwap',
    image: `${imageBasePath}defiswap.webp`,
    color: '#012C70'
  },
  [ON_CHAIN_TRADE_TYPE.DFYN]: {
    name: 'Dfyn',
    image: `${imageBasePath}dfyn.svg`,
    color: '#828CBE'
  },
  [ON_CHAIN_TRADE_TYPE.DLN]: {
    name: 'deBridge',
    image: `${imageBasePath}dln.svg`,
    color: '#9C6FC7'
  },
  [ON_CHAIN_TRADE_TYPE.DODO]: {
    name: 'Dodo',
    image: `${imageBasePath}dodo.png`,
    color: '#efc20b'
  },
  [ON_CHAIN_TRADE_TYPE.DRAGON_SWAP]: {
    name: 'DragonSwap',
    image: `${imageBasePath}dragonswap.svg`,
    color: '#A855F7'
  },
  [ON_CHAIN_TRADE_TYPE.DYSTOPIA]: {
    name: 'Dystopia',
    image: `${imageBasePath}dystopia.png`,
    color: '#085F8E'
  },

  //FFFFFFFFFFFFFFFFFFFFFFF
  [ON_CHAIN_TRADE_TYPE.FENIX_V2]: {
    name: 'Fenix V2',
    image: `${imageBasePath}fenix.svg`,
    color: '#F5710A'
  },
  [ON_CHAIN_TRADE_TYPE.FENIX_V3]: {
    name: 'Fenix V3',
    image: `${imageBasePath}fenix.svg`,
    color: '#F5710A'
  },
  [ON_CHAIN_TRADE_TYPE.FINKUJIRA]: {
    name: 'Finkujira',
    image: `${imageBasePath}finkujira.svg`,
    color: '#0a1124'
  },
  [ON_CHAIN_TRADE_TYPE.FUSIONX]: {
    name: 'FusionX',
    image: `${imageBasePath}fusionx.webp`,
    color: '#b0b3b7'
  },
  [ON_CHAIN_TRADE_TYPE.FRAX_SWAP_V2]: {
    name: 'FraxSwap V2',
    image: `${imageBasePath}fraxswap.svg`,
    color: '#FFFFFF'
  },

  //HHHHHHHHHHHHHHHHHHHHH
  [ON_CHAIN_TRADE_TYPE.HONEY_SWAP]: {
    name: 'HoneySwap',
    image: `${imageBasePath}honeyswap.webp`,
    color: '#efc20b'
  },
  [ON_CHAIN_TRADE_TYPE.HORIZONDEX]: {
    name: 'HorizonDEX',
    image: `${imageBasePath}horixondex.png`,
    color: '#444391'
  },

  //IIIIIIIIIIIIIIIIIIIIIIII
  [ON_CHAIN_TRADE_TYPE.IZUMI]: {
    name: 'Izumi',
    image: `${imageBasePath}izumi.svg`,
    color: '#7E49FC'
  },

  //JJJJJJJJJJJJJJJJJJJJJJJJJJ
  [ON_CHAIN_TRADE_TYPE.JET_SWAP]: {
    name: 'JetSwap',
    image: `${imageBasePath}jetswap.png`,
    color: '#F7C415'
  },
  [ON_CHAIN_TRADE_TYPE.JOE]: {
    name: 'Joe',
    image: `${imageBasePath}joe.png`,
    color: '#6665DD'
  },
  [ON_CHAIN_TRADE_TYPE.JUPITER]: {
    name: 'Jupiter',
    image: `${imageBasePath}jupiter.svg`,
    color: '#34A5F5'
  },
  [ON_CHAIN_TRADE_TYPE.JUPITER_SWAP]: {
    name: 'JupiterSwap',
    image: `${imageBasePath}jupiterswap.svg`,
    color: '#F27523'
  },
  [ON_CHAIN_TRADE_TYPE.J_SWAP]: {
    name: 'JSwap',
    image: `${imageBasePath}jswap.jpg`,
    color: '#5b55e3'
  },

  //KKKKKKKKKKKKKKKKKKKKKK
  [ON_CHAIN_TRADE_TYPE.KIM]: {
    name: 'Kim',
    image: `${imageBasePath}kim.png`,
    color: '#FF4500'
  },
  [ON_CHAIN_TRADE_TYPE.KYBER_SWAP]: {
    name: 'KyberSwap',
    image: `${imageBasePath}kyberswap.svg`,
    color: '#31CB9E'
  },
  // [ON_CHAIN_TRADE_TYPE.KODIAK]: {
  //   name: 'Kodiak',
  //   image: `${imageBasePath}kodiak.svg`,
  //   color: '#34A5F5'
  // },
  // [ON_CHAIN_TRADE_TYPE.KYO_FINANCE]: {
  //   name: 'Kyo Finance',
  //   image: `${imageBasePath}kyo_finance.svg`,
  //   color: '#FF4C00'
  // },

  //LLLLLLLLLLLLLLLLLLLLLLL
  [ON_CHAIN_TRADE_TYPE.LIFI]: {
    color: '#bf38ee',
    image: 'assets/images/icons/providers/bridge/lifi.svg',
    name: 'LiFi'
  },
  [ON_CHAIN_TRADE_TYPE.LUA_SWAP]: {
    name: 'LuaSwap',
    image: `${imageBasePath}luaswap.png`,
    color: '#FABD45'
  },

  //MMMMMMMMMMMMMMMMMMMMMMMM
  [ON_CHAIN_TRADE_TYPE.MAVERICK]: {
    name: 'Maverick',
    image: `${imageBasePath}maverick.png`,
    color: '#6401FF'
  },
  [ON_CHAIN_TRADE_TYPE.MDEX]: {
    name: 'MDEX',
    image: `${imageBasePath}mdex.svg`,
    color: '#50B0E4'
  },
  [ON_CHAIN_TRADE_TYPE.MERLIN_SWAP]: {
    name: 'MerlinSwap',
    image: `${imageBasePath}merlinswap.png`,
    color: '#CF8D39'
  },
  [ON_CHAIN_TRADE_TYPE.MESH_SWAP]: {
    name: 'MeshSwap',
    image: `${imageBasePath}meshswap.svg`,
    color: '#BF96FF'
  },
  [ON_CHAIN_TRADE_TYPE.MM_FINANCE]: {
    name: 'MMFinance',
    image: `${imageBasePath}mmfinance.png`,
    color: '#F0BC82'
  },
  [ON_CHAIN_TRADE_TYPE.MOJITO_SWAP]: {
    name: 'MojitoSwap',
    image: `${imageBasePath}mojitoswap.svg`,
    color: '#0AC4DD'
  },
  [ON_CHAIN_TRADE_TYPE.MUTE_SWAP]: {
    name: 'MuteSwap',
    image: `${imageBasePath}muteswap.webp`,
    color: 'white'
  },

  //NNNNNNNNNNNNNNNNNNNNNNNNN
  [ON_CHAIN_TRADE_TYPE.NET_SWAP]: {
    name: 'NetSwap',
    image: `${imageBasePath}netswap.png`,
    color: '#257AF1'
  },
  [ON_CHAIN_TRADE_TYPE.NATIVE_ROUTER]: {
    name: 'NativeRouter',
    image: `${imageBasePath}native.svg`,
    color: '#34A5F5'
  },

  //OOOOOOOOOOOOOOOOOOOOOOO
  [ON_CHAIN_TRADE_TYPE.ODOS]: {
    name: 'Odos',
    image: `${imageBasePath}odos.svg`,
    color: 'brown'
  },
  [ON_CHAIN_TRADE_TYPE.OKC_SWAP]: {
    name: 'OkcSwap',
    image: `${imageBasePath}okcswap.png`,
    color: '#511785'
  },
  [ON_CHAIN_TRADE_TYPE.OKU_SWAP]: {
    name: 'OkuSwap',
    image: `${imageBasePath}okuswap.png`,
    color: '#323332'
  },
  [ON_CHAIN_TRADE_TYPE.OMNIDEX]: {
    name: 'Omnidex',
    image: `${imageBasePath}omnidex.png`,
    color: '#B18D4F'
  },
  [ON_CHAIN_TRADE_TYPE.ONE_INCH]: {
    name: '1inch',
    image: `${imageBasePath}oneinch.svg`,
    color: '#94A6C3'
  },
  [ON_CHAIN_TRADE_TYPE.ONE_MOON]: {
    name: 'OneMoon',
    image: `${imageBasePath}onemoon.ico`,
    color: '#0B86FF'
  },
  [ON_CHAIN_TRADE_TYPE.ONE_SOL]: {
    name: '1sol',
    image: `${imageBasePath}onesol.png`,
    color: 'white'
  },
  [ON_CHAIN_TRADE_TYPE.OOLONG_SWAP]: {
    name: 'OolongSwap',
    image: `${imageBasePath}oolongswap.png`,
    color: '#F5A14A'
  },
  [ON_CHAIN_TRADE_TYPE.OPEN_OCEAN]: {
    name: 'Open Ocean',
    image: `${imageBasePath}../bridge/openocean.png`,
    color: '#15D9E1'
  },
  [ON_CHAIN_TRADE_TYPE.ORCA_SWAP]: {
    name: 'OrcaSwap',
    image: `${imageBasePath}orcaswap.svg`,
    color: '#F2C45B'
  },
  [ON_CHAIN_TRADE_TYPE.OSMOSIS_SWAP]: {
    name: 'OsmosisSwap',
    image: `${imageBasePath}../bridge/osmosis.svg`,
    color: '#5E12A0'
  },

  //PPPPPPPPPPPPPPPPPPPPPPPPPP
  [ON_CHAIN_TRADE_TYPE.PANCAKE_SWAP]: {
    name: 'PancakeSwap',
    image: `${imageBasePath}pancakeswap.svg`,
    color: '#00ADE8'
  },
  [ON_CHAIN_TRADE_TYPE.PANCAKE_SWAP_V3]: {
    name: 'PancakeSwapV3',
    image: `${imageBasePath}pancakeswap.svg`,
    color: '#00ADE8'
  },
  [ON_CHAIN_TRADE_TYPE.PANGOLIN]: {
    name: 'Pangolin',
    image: `${imageBasePath}pangolin.svg`,
    color: '#FC5408'
  },
  [ON_CHAIN_TRADE_TYPE.PARA_SWAP]: {
    name: 'ParaSwap',
    image: `${imageBasePath}paraswap.svg`,
    color: '#2237ab'
  },
  [ON_CHAIN_TRADE_TYPE.PEGASYS]: {
    name: 'Pegasys',
    image: `${imageBasePath}pegasys.png`,
    color: '#2CC4D2'
  },
  [ON_CHAIN_TRADE_TYPE.PHOTON_SWAP]: {
    name: 'PhotonSwap',
    image: `${imageBasePath}photonswap.png`,
    color: '#8829E2'
  },
  [ON_CHAIN_TRADE_TYPE.POLYDEX]: {
    name: 'Polydex',
    image: `${imageBasePath}polydex.svg`,
    color: '#0D2866'
  },
  [ON_CHAIN_TRADE_TYPE.PITEAS]: {
    name: 'Piteas',
    image: `${imageBasePath}piteas.png`,
    color: '#DF145E'
  },
  [ON_CHAIN_TRADE_TYPE.PULSEX_V1]: {
    name: 'PulseX V1',
    image: `${imageBasePath}pulsex.png`,
    color: '#00ff73'
  },
  [ON_CHAIN_TRADE_TYPE.PULSEX_V2]: {
    name: 'PulseX V2',
    image: `${imageBasePath}pulsex.png`,
    color: '#ff0006'
  },

  //QQQQQQQQQQQQQQQQQQQQQQQQQQQQQ
  [ON_CHAIN_TRADE_TYPE.QUICK_SWAP]: {
    name: 'QuickSwap',
    image: `${imageBasePath}quickswap.svg`,
    color: '#36C2EA'
  },
  [ON_CHAIN_TRADE_TYPE.QUICK_SWAP_V3]: {
    name: 'QuickSwapV3',
    image: `${imageBasePath}quickswap.svg`,
    color: '#36C2EA'
  },

  //RRRRRRRRRRRRRRRRRRRRRRRRRRRR
  [ON_CHAIN_TRADE_TYPE.RANGO]: {
    name: 'Rango',
    image: `assets/images/icons/providers/bridge/rango.png`,
    color: 'blue'
  },
  [ON_CHAIN_TRADE_TYPE.RAYDIUM]: {
    name: 'Raydium',
    image: `${imageBasePath}raydium.svg`,
    color: '#3875FD'
  },
  [ON_CHAIN_TRADE_TYPE.REF_FINANCE]: {
    name: 'Ref Finance',
    image: `${imageBasePath}ref-finance.svg`,
    color: 'grey'
  },
  [ON_CHAIN_TRADE_TYPE.REN_BTC]: {
    name: 'renBTC',
    image: `${imageBasePath}renbtc.svg`,
    color: 'grey'
  },
  [ON_CHAIN_TRADE_TYPE.ROUTER_SWAP]: {
    name: 'Router DEX',
    image: 'assets/images/icons/providers/bridge/router.svg',
    color: '#000000'
  },

  //SSSSSSSSSSSSSSSSSSSSSSSSSS
  [ON_CHAIN_TRADE_TYPE.SABER_STABLE_SWAP]: {
    name: 'SaberStableSwap',
    image: `${imageBasePath}saberstableswap.png`,
    color: '#5156C0'
  },
  [ON_CHAIN_TRADE_TYPE.SAROS_SWAP]: {
    name: 'SarosSwap',
    image: `${imageBasePath}sarosswap.png`,
    color: '#6CBCCE'
  },
  [ON_CHAIN_TRADE_TYPE.SERUM]: {
    name: 'Serum',
    image: `${imageBasePath}serum.png`,
    color: '#38B9CC'
  },
  [ON_CHAIN_TRADE_TYPE.SHIBA_SWAP]: {
    name: 'ShibaSwap',
    image: `${imageBasePath}shibaswap.svg`,
    color: '#6CBCCE'
  },
  [ON_CHAIN_TRADE_TYPE.SMOOTHY]: {
    name: 'Smoothy',
    image: `${imageBasePath}smoothy.png`,
    color: '#BC2723'
  },
  [ON_CHAIN_TRADE_TYPE.SOLANA]: {
    name: 'Solana',
    image: `${imageBasePath}solana.png`,
    color: '#050e42'
  },
  [ON_CHAIN_TRADE_TYPE.SOLAR_BEAM]: {
    name: 'SolarBeam',
    image: `${imageBasePath}solarbeam.svg`,
    color: '#F2A272'
  },
  [ON_CHAIN_TRADE_TYPE.SOUL_SWAP]: {
    name: 'SoulSwap',
    image: `${imageBasePath}soulswap.png`,
    color: '#B06DED'
  },
  [ON_CHAIN_TRADE_TYPE.SPACEFI_SWAP]: {
    name: 'SpaceFiSwap',
    image: `${imageBasePath}spacefi.svg`,
    color: 'white'
  },
  [ON_CHAIN_TRADE_TYPE.SPIRIT_SWAP]: {
    name: 'SpiritSwap',
    image: `${imageBasePath}spiritswap.png`,
    color: '#59C3C8'
  },
  [ON_CHAIN_TRADE_TYPE.SPL_TOKEN_SWAP]: {
    name: 'SplTokenSwap',
    image: `${imageBasePath}spltokenswap.svg`,
    color: '#15F095'
  },
  [ON_CHAIN_TRADE_TYPE.SPOOKY_SWAP]: {
    name: 'SpookySwap',
    image: `${imageBasePath}spookyswap.svg`,
    color: '#59C3C8'
  },
  [ON_CHAIN_TRADE_TYPE.STELLA_SWAP]: {
    name: 'StellaSwap',
    image: `${imageBasePath}stellaswap.svg`,
    color: '#E2107B'
  },
  [ON_CHAIN_TRADE_TYPE.STONFI]: {
    name: 'StonFi',
    image: `${imageBasePath}stonfi.png`,
    color: '#066ccc',
    averageTime: 5
  },
  [ON_CHAIN_TRADE_TYPE.SUN_SWAP]: {
    name: 'SunSwap',
    image: `${imageBasePath}sunswap.svg`,
    color: 'orange'
  },
  [ON_CHAIN_TRADE_TYPE.SURFDEX]: {
    name: 'Surfdex',
    image: `${imageBasePath}surfswap.png`,
    color: '#39E4DD'
  },
  [ON_CHAIN_TRADE_TYPE.SUSHI_SWAP]: {
    name: 'SushiSwap',
    image: `${imageBasePath}sushiswap.svg`,
    color: '#E05DAA'
  },
  [ON_CHAIN_TRADE_TYPE.SYMBIOSIS_SWAP]: {
    name: 'Symbiosis Dex',
    image: 'assets/images/icons/providers/bridge/symbiosis.png',
    color: '#79d778'
  },
  [ON_CHAIN_TRADE_TYPE.SYNAPSE]: {
    name: 'Synapse Swapper',
    image: 'assets/images/icons/providers/bridge/synapse.png',
    color: 'purple'
  },
  [ON_CHAIN_TRADE_TYPE.SYNC_SWAP]: {
    name: 'Sync Swap',
    image: 'assets/images/icons/providers/bridge/syncswap.svg',
    color: '#79d778'
  },
  [ON_CHAIN_TRADE_TYPE.SQUIDROUTER]: {
    name: 'Squid Router',
    image: 'assets/images/icons/providers/bridge/squidrouter.svg',
    color: '#e6f936'
  },
  [ON_CHAIN_TRADE_TYPE.SPARK_DEX]: {
    name: 'Spark Dex',
    image: `${imageBasePath}sparkdex.svg`,
    color: '#000000'
  },
  [ON_CHAIN_TRADE_TYPE.SPARK_DEX_V3]: {
    name: 'Spark Dex V3',
    image: `${imageBasePath}sparkdex.svg`,
    color: '#000000'
  },

  //TTTTTTTTTTTTTTTTTTTTTTTTTTT
  [ON_CHAIN_TRADE_TYPE.TONCO_DEX]: {
    name: 'ToncoDex',
    image: `${imageBasePath}tonco-dex.svg`,
    color: '#00CAB2'
  },
  [ON_CHAIN_TRADE_TYPE.TRADER]: {
    name: 'The Trader',
    image: `${imageBasePath}sushiswap.svg`,
    color: '#E05DAA'
  },
  [ON_CHAIN_TRADE_TYPE.TRISOLARIS]: {
    name: 'Trisolaris',
    image: `${imageBasePath}trisolaris.svg`,
    color: '#00F4FF'
  },

  //UUUUUUUUUUUUUUUUUUUUUUUUUU
  [ON_CHAIN_TRADE_TYPE.UBE_SWAP]: {
    name: 'UbeSwap',
    image: `${imageBasePath}ubeswap.svg`,
    color: '#6D619A'
  },
  [ON_CHAIN_TRADE_TYPE.UNISWAP_V2]: {
    name: 'Uniswap V2',
    image: `${imageBasePath}uniswap-2.svg`,
    color: '#F9DBEA'
  },
  // [ON_CHAIN_TRADE_TYPE.UNISWAP_BAHAMUT]: {
  //   name: 'Uniswap Nahamut',
  //   image: `${imageBasePath}uniswap-2.svg`,
  //   color: '#F9DBEA'
  // },
  [ON_CHAIN_TRADE_TYPE.UNI_SWAP_V3]: {
    name: 'Uniswap V3',
    image: `${imageBasePath}uniswap-3.svg`,
    color: '#FD017A'
  },
  [ON_CHAIN_TRADE_TYPE.SILK_SWAP]: {
    name: 'SilkSwap',
    image: `${imageBasePath}silkswap.svg`,
    color: '#000000'
  },
  [ON_CHAIN_TRADE_TYPE.KUJATA]: {
    name: 'Kujata',
    image: `${imageBasePath}kujata.svg`,
    color: '#FFFFFF'
  },
  [ON_CHAIN_TRADE_TYPE.UNIZEN]: {
    name: 'Unizen',
    image: 'assets/images/icons/providers/bridge/unizen.png',
    color: '#00805C'
  },

  //VVVVVVVVVVVVVVVVVVVVVVVVVVV
  [ON_CHAIN_TRADE_TYPE.VERSE]: {
    name: 'Verse',
    image: `${imageBasePath}verse.png`,
    color: '#0085FF'
  },
  [ON_CHAIN_TRADE_TYPE.VIPER_SWAP]: {
    name: 'Viper',
    image: `${imageBasePath}viperswap.svg`,
    color: '#00805C'
  },
  [ON_CHAIN_TRADE_TYPE.VOOI]: {
    name: 'Vooi',
    image: `${imageBasePath}vooi.svg`,
    color: '#084b69'
  },
  [ON_CHAIN_TRADE_TYPE.VOLTAGE_SWAP]: {
    name: 'VoltageSwap',
    image: `${imageBasePath}voltageswap.png`,
    color: '#23A863'
  },
  [ON_CHAIN_TRADE_TYPE.VVS_FINANCE]: {
    name: 'VVSFinance',
    image: `${imageBasePath}vvsfinance.png`,
    color: '#2B3852'
  },

  //WWWWWWWWWWWWWWWWWWWWWWWWWWW
  [ON_CHAIN_TRADE_TYPE.WAGYU_SWAP]: {
    name: 'WagyuSwap',
    image: `${imageBasePath}wagyuswap.png`,
    color: '#DE2549'
  },
  [ON_CHAIN_TRADE_TYPE.WANNA_SWAP]: {
    name: 'Wannaswap',
    image: `${imageBasePath}wannaswap.svg`,
    color: '#FACB5B'
  },
  [ON_CHAIN_TRADE_TYPE.WAULT_SWAP]: {
    name: 'WaultSwap',
    image: `${imageBasePath}waultswap.png`,
    color: '#1E7C77'
  },
  [ON_CHAIN_TRADE_TYPE.WOO_FI]: {
    name: 'WooFi',
    image: `${imageBasePath}woofi.png`,
    color: '#72BEF4'
  },
  [ON_CHAIN_TRADE_TYPE.WRAPPED]: {
    name: 'Wrapped',
    image: `${imageBasePath}wrapped.png`,
    color: '#34A5F5'
  },
  [ON_CHAIN_TRADE_TYPE.WYND]: {
    name: 'WyndDex',
    image: `${imageBasePath}wynd.svg`,
    color: '#7e8087'
  },

  //XXXXXXXXXXXXXXXXXXXXXXXXXXX
  [ON_CHAIN_TRADE_TYPE.XY_DEX]: {
    name: 'XY',
    image: 'assets/images/icons/providers/bridge/xy.svg',
    color: '#1f4d96'
  },

  //YYYYYYYYYYYYYYYYYYYYYYYYYY
  [ON_CHAIN_TRADE_TYPE.YUZU_SWAP]: {
    name: 'YuzuSwap',
    image: `${imageBasePath}yuzuswap.png`,
    color: '#EE5466'
  },

  //ZZZZZZZZZZZZZZZZZZZZZZZZZ
  [ON_CHAIN_TRADE_TYPE.ZAPPY]: {
    name: 'Zappy',
    image: `${imageBasePath}zappy.svg`,
    color: '#00e7e7'
  },
  [ON_CHAIN_TRADE_TYPE.ZIP_SWAP]: {
    name: 'ZipSwap',
    image: `${imageBasePath}zipswap.svg`,
    color: '#34A5F5'
  },
  [ON_CHAIN_TRADE_TYPE.ZRX]: {
    name: '0x',
    image: `${imageBasePath}zrx.svg`,
    color: '#34A5F5'
  },
  [ON_CHAIN_TRADE_TYPE.ZETA_SWAP]: {
    name: 'ZetaSwap',
    image: `${imageBasePath}zetaswap.svg`,
    color: '#34A5F5'
  },
  [ON_CHAIN_TRADE_TYPE.MACARON]: {
    name: 'Macaron',
    image: `${imageBasePath}macaron.svg`,
    color: '#f6d03a'
  }
  // [ON_CHAIN_TRADE_TYPE.BULBA_SWAP]: {
  //   name: 'BulbaSwap',
  //   image: `${imageBasePath}bulba-swap.svg`,
  //   color: '#41c533'
  // }
};

export const ON_CHAIN_PROVIDERS: Record<OnChainTradeType, ProviderInfo> = Object.fromEntries(
  Object.entries(onChainTradeProviders).map(([key, value]: [OnChainTradeType, ProviderInfo]) => [
    key,
    { averageTime: 1, ...value }
  ])
) as Record<OnChainTradeType, ProviderInfo>;
