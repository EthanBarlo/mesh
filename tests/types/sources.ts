import type { Config } from "../../resources/js/types";

// Vite's default glob type must be accepted without a type argument.
const sources: Config["sources"] = [
    import.meta.glob("/vendor/acme/widgets/resources/js/mesh/**/index.tsx"),
    {
        modules: import.meta.glob(
            "/vendor/acme/widgets/resources/js/mesh/**/index.tsx"
        ),
        prefix: "Acme",
    },
];

void sources;
