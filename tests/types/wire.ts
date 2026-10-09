import type { Wire } from "../../resources/js/types";

// Type-level checks for Wire against Livewire 4.3's $wire (js/$wire.js).
// Compiled by `npm run typecheck`; never executed.
declare const wire: Wire;
declare const file: File;

async function requests() {
    // $set / $toggle default `live` to true and return the request's promise.
    const set: Promise<void> = wire.$set("name", "x");
    const deferred: Promise<void> = wire.$set("name", "x", false);
    const toggled: Promise<void> = wire.$toggle("open");
    const committed: Promise<void> = wire.$commit();
    await Promise.all([set, deferred, toggled, committed, wire.$refresh()]);

    // $get takes an optional `reactive` flag.
    wire.$get("name");
    wire.$get("name", false);
}

function fireAndForget() {
    // Dispatch params are optional.
    wire.$dispatch("saved");
    wire.$dispatchSelf("saved");
    wire.$dispatchTo("cart", "saved");
    wire.$dispatch("saved", { id: 1 });

    // Upload callbacks are optional; the uploads return nothing.
    const upload: void = wire.$upload("photo", file);
    wire.$upload(
        "photo",
        file,
        (tmpFilename: string) => void tmpFilename,
        () => {},
        (event) => void event.detail.progress,
        () => {}
    );
    wire.$uploadMultiple("photos", [file], (names: string[]) => void names);
    wire.$uploadMultiple("photos", [file], undefined, undefined, undefined, undefined, false);
    const removed: void = wire.$removeUpload("photo", "tmp.jpg");
    wire.$removeUpload("photo", "tmp.jpg", (tmpFilename: string) => void tmpFilename);
    // @ts-expect-error Livewire never calls an error callback for $removeUpload.
    wire.$removeUpload("photo", "tmp.jpg", () => {}, () => {});
    wire.$cancelUpload("photo");
    wire.$cancelUpload("photo", () => {});
    void upload;
    void removed;
}

function parent() {
    // $parent is undefined (not null) at the top of the tree.
    const p: Wire | undefined = wire.$parent;
    // @ts-expect-error $parent may be undefined.
    wire.$parent.$refresh();
    void p;
}

void requests;
void fireAndForget;
void parent;
