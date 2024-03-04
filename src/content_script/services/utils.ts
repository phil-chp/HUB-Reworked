export function mySleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export enum Status {
    NONE,
    ERROR,
    SUCCESS,
    NEED_USER_INPUT
};