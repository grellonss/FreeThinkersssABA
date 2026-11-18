import { getTransportGuide } from "./transport";

test("ogni guida ha le stesse sezioni in it, en, de", () => {
    for (const city of ["Camerino", "Olten"]) {
        const ids = (lang) => getTransportGuide(city, lang).sections.map((s) => s.id);
        expect(ids("en")).toEqual(ids("it"));
        expect(ids("de")).toEqual(ids("it"));
    }
});

test("città non coperta o lingua sconosciuta", () => {
    expect(getTransportGuide("Urbino", "it")).toBeNull();
    expect(getTransportGuide(" camerino ", "fr").facts).toEqual(getTransportGuide("Camerino", "it").facts);
});
