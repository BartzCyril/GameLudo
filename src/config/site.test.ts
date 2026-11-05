import {CONTACT_EMAIL, EDITOR_NAME} from "@/config/site";

// Fails on purpose until the two values are filled in: the deployment runs the tests first.
it("names the publisher of the site", () => {
    expect(EDITOR_NAME).not.toBe("");
    expect(CONTACT_EMAIL).toMatch(/^\S+@\S+\.\S+$/);
});
