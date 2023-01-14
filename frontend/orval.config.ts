export default {
    qrtagger: {
        output: {
            mode: "tags-split",
            target: "src/api/qrtagger.ts",
            schemas: "src/api/model",
            client: "react-query",
        },
        input: {
            target: "../openapi/v1/schema.yaml",
        },
    },
};
