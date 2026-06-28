export async function register() {
    // Nothing to register at startup
}

export async function onRequestError(
    err: { digest?: string } & Error,
    request: { path: string; method: string; headers: Record<string, string | string[]> },
    context: {
        routerKind: 'Pages Router' | 'App Router';
        routePath: string;
        routeType: 'render' | 'route' | 'action' | 'middleware';
    }
) {
    // Skip cancelled requests (user navigated away) and not-found errors
    if (err.digest === 'NEXT_NOT_FOUND' || err.digest === 'NEXT_REDIRECT') return;

    try {
        const { logError } = await import('@/lib/logError');
        await logError({
            error: err,
            route: `${request.method} ${request.path}`,
            context: `${context.routeType} · ${context.routerKind} · digest: ${err.digest ?? 'none'}`,
        });
    } catch {
        // Never let instrumentation crash the app
        console.error('[instrumentation] Failed to log error:', err.message);
    }
}
