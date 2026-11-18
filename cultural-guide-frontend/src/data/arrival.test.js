import { getArrivalGuide, loadDone, saveDone } from "./arrival";

test("ogni passo ha testo in it, en, de e prerequisiti esistenti che vengono prima", () => {
    for (const city of ["Camerino", "Olten"]) {
        for (const lang of ["it", "en", "de"]) {
            const { steps } = getArrivalGuide(city, lang);
            steps.forEach((step, i) => {
                expect(step.title).toBeTruthy();
                expect(step.text).toBeTruthy();
                for (const need of step.needs) {
                    const at = steps.findIndex((s) => s.id === need);
                    expect(at).toBeGreaterThanOrEqual(0);
                    expect(at).toBeLessThan(i);
                }
            });
        }
    }
});

test("città non coperta e salvataggio dei passi fatti", () => {
    expect(getArrivalGuide("Urbino", "it")).toBeNull();
    saveDone("Camerino", ["codice"]);
    expect(loadDone(" camerino ")).toEqual(["codice"]);
    expect(loadDone("Olten")).toEqual([]);
});
