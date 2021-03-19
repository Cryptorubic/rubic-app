enum CONTENT_TYPE {
  VOLUME = 'volume'
}

interface Content {
  volume: VolumeContent;
}

interface VolumeContent extends Content {
  instantTradesVolume: string;
  orderBookVolume: string;
}
