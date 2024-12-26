/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

// export default {
// 	async fetch(request, env, ctx): Promise<Response> {
// 		return new Response('Hello cloudflare workers!');
// 	},
// } satisfies ExportedHandler<Env>;

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
        } else if (url.pathname === "/list") {
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
        } else {
            return new Response("Not Found", { status: 404 });
        }
    },
} satisfies ExportedHandler<Env>;
