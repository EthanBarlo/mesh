import type { Wire, WireErrors } from "../../resources/js/types";

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

function interceptors() {
    // Every $intercept* returns an unsubscribe and takes an optional action name.
    const offAction: () => void = wire.$intercept(({ action, onSuccess, onError }) => {
        void action;
        onSuccess((result) => void result);
        onError(({ response, body, preventDefault }) => {
            const status: number = response.status;
            void status;
            void body;
            preventDefault();
        });
    });
    wire.$interceptAction("save", ({ onFinish }) => onFinish(() => {}));

    const offMessage: () => void = wire.$interceptMessage(({ onSuccess, cancel }) => {
        void cancel;
        onSuccess(({ payload, onSync, onMorph, onMorphed, onRender }) => {
            const errors: Record<string, string[]> = payload.snapshot.memo.errors;
            void errors;
            onSync(() => {});
            onMorph(async () => {});
            onMorphed(() => {});
            onRender(() => {});
        });
    });
    wire.$interceptMessage("save", ({ onSkipped }) => onSkipped(() => {}));

    const offRequest: () => void = wire.$interceptRequest(({ onRedirect, onSend }) => {
        onRedirect(({ url, preventDefault }) => {
            const to: string = url;
            void to;
            preventDefault();
        });
        onSend(async ({ responsePromise }) => void (await responsePromise).ok);
    });

    // @ts-expect-error The action name comes before the callback.
    wire.$interceptMessage(() => {}, "save");
    // @ts-expect-error Message interceptors have no onRedirect.
    wire.$interceptMessage(({ onRedirect }) => void onRedirect);

    offAction();
    offMessage();
    offRequest();
}

function helpers() {
    // $errors mirrors Laravel's MessageBag.
    const errors: WireErrors = wire.$errors;
    const first: string = errors.first("email");
    const all: string[] = errors.get("email");
    const any: boolean = errors.has() || errors.has("a", "b") || errors.has(["a", "b"]);
    errors.clear("email");
    errors.clear();

    const dirty: boolean = wire.$dirty() || wire.$dirty("name") || wire.$dirty(["a", "b"]);

    // $js and $refs are callable and also index by name.
    wire.$js("bump", () => 1);
    wire.$js.bump = () => 2;
    wire.$js.bump();
    const ref: HTMLElement | undefined = wire.$refs("input") ?? wire.$refs.input;

    // $island returns the wire for chaining.
    const chained: Wire = wire.$island("feed", { mode: "append" });
    void chained.$refresh();
    // @ts-expect-error Islands only morph, append or prepend.
    wire.$island("feed", { mode: "replace" });

    wire.$dispatchEl("input", "focus-me");
    wire.$dispatchRef("modal", "open", { id: 1 });

    // $on stays void: Livewire's listen() returns nothing to unsubscribe with.
    const on: void = wire.$on("saved", () => {});

    void [first, all, any, dirty, ref, on];
}

void requests;
void fireAndForget;
void parent;
void interceptors;
void helpers;
