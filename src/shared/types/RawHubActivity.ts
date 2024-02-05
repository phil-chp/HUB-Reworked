export default interface RawHubActivity {
  codeacti: string;
  title: string;
  description: string;
  type_title: string;
  events: RawHubActivityEvent[];
  end: string;
}

export interface RawHubActivityEvent {
  begin: string;
  end: string;
  user_status: string;
}
