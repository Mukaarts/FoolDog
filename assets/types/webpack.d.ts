declare interface RequireContext {
    keys(): string[];
    (id: string): unknown;
    <T>(id: string): T;
    resolve(id: string): string;
    id: string;
}

declare namespace __WebpackModuleApi {
    interface RequireContext {
        keys(): string[];
        (id: string): unknown;
        <T>(id: string): T;
        resolve(id: string): string;
        id: string;
    }
}

declare interface NodeRequire {
    context(
        directory: string,
        useSubdirectories?: boolean,
        regExp?: RegExp
    ): __WebpackModuleApi.RequireContext;
}
