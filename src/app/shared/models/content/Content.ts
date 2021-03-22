import VolumeContent from './VolumeContent';
import TeamCardContent from './TeamCardContent';
import CollaborationsContent from './CollaborationsContent';

export default interface Content {
  volume: VolumeContent;
  team: TeamCardContent[];
  collaborations: CollaborationsContent[];
}
