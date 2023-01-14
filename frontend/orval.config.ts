export default {
    qrtagger: {
        output: {
            mode: "tags-split",
            target: "src/api/qrtagger.ts",
            schemas: "src/api/model",
            client: "react-query",
            override: {
                mutator: {
                    path: "./src/api/customClient.ts",
                    name: "useCustomClient",
                },
            },
        },
        input: {
            target: "../openapi/v1/schema.yaml",
        },
    },
};
