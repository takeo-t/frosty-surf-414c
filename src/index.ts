interface Env {
    DATABASE: {
        prepare: (query: string) => {
            all: () => Promise<{ results: any[] }>;
            run: (params: any[]) => Promise<void>;
        };
    };
}

export default {
    async fetch(request: Request, env: Env, ctx): Promise<Response> {
        const url = new URL(request.url);
        if (url.pathname === "/add") {
            try {
                await env.DATABASE.prepare("INSERT INTO todos (name) VALUES (?)").run(["hello name cloudflare"]);
                return new Response("Record added successfully", { status: 200 });
            } catch (error: any) {
                return new Response(`Error: ${error.message}\nStack: ${error.stack}`, {
                    status: 500,
                });
            }
        }
        if (url.pathname === "/list") {
            try {
                const { results } = await env.DATABASE.prepare("SELECT * FROM todos").all();
                return new Response(JSON.stringify(results), {
                    headers: { "Content-Type": "application/json" },
                });
            } catch (error: any) {
                return new Response(`Error: ${error.message}\nStack: ${error.stack}`, {
                    status: 500,
                });
            }
        }
        return new Response("Not Found", { status: 404 });
    },
} satisfies ExportedHandler<Env>;
