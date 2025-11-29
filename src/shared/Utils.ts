export class Utils {
    static delay(time: number) {
        return new Promise((resolve) => setTimeout(resolve, time));
    }
}
