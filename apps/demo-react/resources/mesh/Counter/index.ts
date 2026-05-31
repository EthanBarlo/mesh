import { registerComponent } from "@mesh";
import Counter from "./Counter";

registerComponent("react", "resources/mesh/Counter/index.ts", Counter);

export default Counter;
