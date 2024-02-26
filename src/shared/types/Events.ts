export interface HUBEvent {
    title: string;
    description: string;
    date: string;
    url: string;
    thumbnail: string;
    venue: string;
    location: {
        lat: number;
        lon: number;
    };
}

export default interface HUBEvents {
    d: number;
    events: HUBEvent[];
}
