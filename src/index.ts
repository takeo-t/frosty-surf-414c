interface Env {
    DATABASE: {
        prepare: (query: string) => {
            all: () => Promise<{ results: any[] }>;
            run: (params: { [key: string]: any }) => Promise<void>;
        };
    };
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);

        if (url.pathname === "/add" && request.method === "POST") {
            const { name } = await request.json() as { name: string };
            console.log("Received name:", name);
            try {
                console.log("Prepared query: INSERT INTO todos (name) VALUES (?)");
                console.log("Parameters:", [name]);


                // await env.DATABASE
                // .prepare("INSERT INTO todos (name) VALUES (?);")
                // .run({ name });
                const escapedName = name.replace(/"/g, '\\"'); // ダブルクオートをエスケープ
                const query = `INSERT INTO todos (name) VALUES ("${escapedName}");`;
                await env.DATABASE.prepare(query).run([]);


                return new Response("Record added successfully", { status: 200 });
            } catch (error: any) {
                return new Response(`Error: ${error.message}\nStack: ${error.stack}`, {
                    status: 500,
                });
            }
        }

        if (url.pathname === "/list" && request.method === "GET") {
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
    }
} satisfies ExportedHandler<Env>;
