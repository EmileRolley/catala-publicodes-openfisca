import Engine from "publicodes";
import rules, { RuleName } from "../publicodes-build";
import { describe, expect, test } from "vitest";

const globalEngine = new Engine<RuleName>(rules);

describe("Calcul de l'impôt sur le revenu", () => {
  test("sans enfants avec un revenu > 10 000 €/an", () => {
    const engine = globalEngine.shallowCopy().setSituation({
      "personne . revenu": "230000 €/an",
      "personne . nombre d'enfants": 0,
    });

    const result = engine.evaluate("impôt sur le revenu à deux tranches");
    expect(result.nodeValue).toBe(72000);
  });

  test("sans enfants avec un revenu < 10 000 €/an", () => {
    const engine = globalEngine.shallowCopy().setSituation({
      "personne . revenu": "4000 €/an",
      "personne . nombre d'enfants": 0,
    });

    const result = engine.evaluate("impôt sur le revenu à deux tranches");
    expect(result.nodeValue).toBeNull();
  });

  test("avec plus de 7 enfants", () => {
    const engine = globalEngine.shallowCopy().setSituation({
      "personne . revenu": "230000 €/an",
      "personne . nombre d'enfants": 7,
    });

    const result = engine.evaluate("impôt sur le revenu à deux tranches");
    expect(result.nodeValue).toBeNull();

    engine.setSituation({
      "personne . revenu": "4000 €/an",
      "personne . nombre d'enfants": 7,
    });

    const result2 = engine.evaluate("impôt sur le revenu à deux tranches");
    expect(result2.nodeValue).toBeNull();
  });
});

describe("Calcul de l'amende", () => {
  test("revenu < 10 000 €/an", () => {
    const engine = globalEngine.shallowCopy().setSituation({
      "personne . revenu": "4000 €/an",
      "personne . nombre d'enfants": 0,
    });

    const result = engine.evaluate("base amende");
    expect(result.nodeValue).toBe(500);
  });
});

describe("Patrimoine plafonné", () => {
  test("total < plafond", () => {
    const engine = globalEngine.shallowCopy().setSituation({
      "patrimoine soumis à l'IFI . total du patrimoine": "1000000 €",
      "patrimoine soumis à l'IFI . valeur bâtiment caritatif": "500000 €",
    });

    const result = engine.evaluate("patrimoine soumis à l'IFI");
    expect(result.nodeValue).toBe(500000);
  });

  test("total - bâtiment caritatif < plafond", () => {
    const engine = globalEngine.shallowCopy().setSituation({
      "patrimoine soumis à l'IFI . total du patrimoine": "3000000 €",
      "patrimoine soumis à l'IFI . valeur bâtiment caritatif": "1000000 €",
    });

    const result = engine.evaluate("patrimoine soumis à l'IFI");
    expect(result.nodeValue).toBe(2000000);
  });

  test("total - bâtiment caritatif > plafond", () => {
    const engine = globalEngine.shallowCopy().setSituation({
      "patrimoine soumis à l'IFI . total du patrimoine": "3000000 €",
      "patrimoine soumis à l'IFI . valeur bâtiment caritatif": "1000 €",
    });

    const result = engine.evaluate("patrimoine soumis à l'IFI");
    expect(result.nodeValue).toBe(2500000);
  });
});
