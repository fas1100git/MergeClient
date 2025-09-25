type ThrottledFunction<T extends (...args: any[]) => any> = {
    (...args: Parameters<T>): void;
    cancel: () => void;
};

export function throttle<T extends (...args: any[]) => any>(
    func: T,
    delay: number
): ThrottledFunction<T> {
    let lastCall = 0;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let lastArgs: Parameters<T> | null = null;

    const throttled = (...args: Parameters<T>) => {
        const now = Date.now();
        lastArgs = args;

        if (now - lastCall < delay) {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            timeoutId = setTimeout(() => {
                lastCall = Date.now();
                func(...lastArgs!);
            }, delay - (now - lastCall));
            return;
        }

        lastCall = now;
        func(...args);
    };

    throttled.cancel = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
    };

    return throttled;
}