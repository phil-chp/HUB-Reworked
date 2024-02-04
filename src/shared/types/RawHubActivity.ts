export interface RawHubActivity {
  codeacti: string;
  title: string;
  description: string;
  type_title: string;
  events: RawHubActivityEvent[];
}

export interface RawHubActivityEvent {
  begin: string;
  end: string;
  user_status: any;
}
