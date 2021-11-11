export function assertEnvironment(adaptor, environment) {
    const error = environmentError(adaptor, environment);
    if (error)
        throw error;
}
export function environmentError(adaptor, environment) {
    if (environment && adaptor.environment !== environment)
        return new Error(`Expected ${environment} environment`);
}
//# sourceMappingURL=index.js.map