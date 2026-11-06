import {applyTheme, setTheme, THEME_KEY, THEME_SCRIPT} from "@/game/ui/theme";

const fakeStorage = (saved: string | null) => ({getItem: () => saved, setItem: jest.fn()});
const brokenStorage = {
    getItem: () => {
        throw new Error("denied");
    },
    setItem: () => {
        throw new Error("denied");
    },
};

function browser(storage: object, deviceDark: boolean) {
    const document = {documentElement: {dataset: {} as Record<string, string>}};
    const matchMedia = () => ({matches: deviceDark});
    Object.assign(globalThis, {document, matchMedia, localStorage: storage});
    return document.documentElement.dataset;
}

describe.each([
    ["the inline script", () => new Function(THEME_SCRIPT)()],
    ["applyTheme", applyTheme],
])("%s", (_, run) => {
    it.each([
        ["a saved choice beats the device", fakeStorage("light"), true, "light"],
        ["a saved choice beats the device", fakeStorage("dark"), false, "dark"],
        ["no choice follows a dark device", fakeStorage(null), true, "dark"],
        ["no choice follows a light device", fakeStorage(null), false, "light"],
        ["a bad value follows the device", fakeStorage("blue"), true, "dark"],
        ["blocked storage follows the device", brokenStorage, true, "dark"],
    ])("%s", (_, storage, deviceDark, expected) => {
        const dataset = browser(storage, deviceDark);
        run();
        expect(dataset.theme).toBe(expected);
    });
});

describe("setTheme", () => {
    it("applies and saves the choice", () => {
        const storage = fakeStorage(null);
        const dataset = browser(storage, false);
        setTheme("dark");
        expect(dataset.theme).toBe("dark");
        expect(storage.setItem).toHaveBeenCalledWith(THEME_KEY, "dark");
    });

    it("still applies it when storage is blocked", () => {
        const dataset = browser(brokenStorage, false);
        setTheme("dark");
        expect(dataset.theme).toBe("dark");
    });
});
