export interface SpaceIdData {
  name: string;
  avatar: string | null;
}

export interface SpaceIdGetMetadataResponse {
  attributes: MetadataAttribute[];
  description: string;
  image: string;
  name: string;
}

interface MetadataAttribute {
  display_type: string;
  trait_type: string;
  value: number;
}
