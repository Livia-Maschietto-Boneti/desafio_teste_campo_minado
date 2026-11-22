import test from "node:test";
import { GAME_TESTS } from "../src/test-cases.js";

for (const testCase of GAME_TESTS) {
  test(testCase.title, () => testCase.run());
}
