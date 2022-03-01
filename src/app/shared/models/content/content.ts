import VolumeContent from 'src/app/shared/models/content/volume-content';
import CollaborationsContent from 'src/app/shared/models/content/collaborations-content';

export default interface Content {
  volume: VolumeContent;
  collaborations: CollaborationsContent[];
}
