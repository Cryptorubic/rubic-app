import VolumeContent from 'src/app/shared/models/content/volume-content';
import TeamCardContent from 'src/app/shared/models/content/team-card-content';
import CollaborationsContent from 'src/app/shared/models/content/collaborations-content';

export default interface Content {
  volume: VolumeContent;
  team: TeamCardContent[];
  collaborations: CollaborationsContent[];
}
