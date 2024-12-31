import Engine from "publicodes";
import rules, { RuleName } from "../publicodes-build";
import { describe, expect, test } from "vitest";

describe("Calcul de l'impôt sur le revenu", () => {
  test("Test1", () => {
    const engine = new Engine<RuleName>(rules).setSituation({
      "personne . revenu": "230000 €/an",
      "personne . nombre d'enfants": 0,
    });

    const result = engine.evaluate("impôt sur le revenu à deux tranches");
    expect(result.nodeValue).toBe(72000);
  });

  test("Test1", () => {
    const engine = new Engine<RuleName>(rules).setSituation({
      "personne . revenu": "4000 €/an",
      "personne . nombre d'enfants": 0,
    });

    const result = engine.evaluate("impôt sur le revenu à deux tranches");
    expect(result.nodeValue).toBeNull();
  });
});
