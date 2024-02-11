export default interface RawHubActivity {
  codeacti: string;
  title: string;
  type_title: string;
  registered: RawHubProjectRegistered[];
  end: string;
}

export interface RawHubProjectRegistered {
  master: RawHubProjectMaster;
  members: RawHubProjectMember[];
}


export interface RawHubProjectMaster {
  login: string;
  status: string;
}


export interface RawHubProjectMember {
  login: string;
  status: string;
}
