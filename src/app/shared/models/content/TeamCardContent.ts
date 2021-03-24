interface TeamCardLink {
  icon: string;
  url: string;
}

export default interface TeamCardContent {
  img: string;
  name: string;
  role: string;
  links: Array<TeamCardLink>;
}
