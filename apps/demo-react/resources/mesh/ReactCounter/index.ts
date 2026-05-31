import { registerComponent } from "@mesh";
import ReactCounter from "./ReactCounter";

registerComponent("react", "resources/mesh/ReactCounter/index.ts", ReactCounter);

export default ReactCounter;
