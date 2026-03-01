declare module '@symfony/stimulus-bridge' {
    import type { Application } from '@hotwired/stimulus';

    export function startStimulusApp(context: __WebpackModuleApi.RequireContext): Application;
}

declare module '@symfony/stimulus-bridge/lazy-controller-loader!*' {
    const value: Record<string, unknown>;
    export default value;
}
