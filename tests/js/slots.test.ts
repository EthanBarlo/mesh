import { describe, expect, it } from "vitest";
import { stripFragmentMarkers } from "../../resources/js/utils";

// Markers mirror Livewire's Slot::toHtml() output: a FRAGMENT opening comment
// and an ENDFRAGMENT closing comment wrap the slot content.
const open = (meta: string) => `<!--[if FRAGMENT:${meta}]><![endif]-->`;
const close = (meta: string) => `<!--[if ENDFRAGMENT:${meta}]><![endif]-->`;
const meta = "name=default|type=slot|id=abc|token=123|mode=morph";

describe("stripFragmentMarkers", () => {
    it("strips a wrapping FRAGMENT/ENDFRAGMENT pair, leaving the inner HTML", () => {
        const html = `${open(meta)}Hello <strong>x</strong>${close(meta)}`;

        expect(stripFragmentMarkers(html)).toBe("Hello <strong>x</strong>");
    });

    it("leaves HTML without markers untouched", () => {
        expect(stripFragmentMarkers("<p>plain</p>")).toBe("<p>plain</p>");
    });

    it("returns an empty string when only markers are present", () => {
        expect(stripFragmentMarkers(`${open(meta)}${close(meta)}`)).toBe("");
    });

    it("strips multiple marker pairs", () => {
        const titleMeta = "name=title|type=slot|id=abc|token=456|mode=morph";
        const html =
            `${open(titleMeta)}T${close(titleMeta)}` +
            `${open(meta)}body${close(meta)}`;

        expect(stripFragmentMarkers(html)).toBe("Tbody");
    });

    it("strips markers for named slots regardless of metadata", () => {
        const namedMeta = "name=footer|type=slot|id=xyz|token=789|mode=skip";
        const html = `${open(namedMeta)}<a href="#">link</a>${close(namedMeta)}`;

        expect(stripFragmentMarkers(html)).toBe('<a href="#">link</a>');
    });
});
