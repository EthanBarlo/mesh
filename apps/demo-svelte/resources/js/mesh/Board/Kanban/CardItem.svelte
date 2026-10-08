<script lang="ts">
    import type { Card } from "./types";

    interface Props {
        card: Card;
    }

    let { card }: Props = $props();
</script>

<!--
    The visual card (a paper tag), styled by the shared `.ticket` classes in
    ecosystem.css, which the Blade-composed Kanban uses too. The <li> is the
    ticket itself because @formkit/drag-and-drop puts its drag classes
    (ticket--lifted, ticket--slot) on the draggable node. The class list stays
    static so a re-render never strips them. data-card-id marks it as a
    draggable node (the empty-state <li> in Column.svelte is skipped).
-->
<li
    data-card-id={card.id}
    class="lane__grab ticket touch-none"
    aria-label={`${card.title} (${card.tag})`}
>
    <p class="ticket__title">{card.title}</p>
    <div class="ticket__foot">
        <span class="ticket__tag">{card.tag}</span>
        <span class="ticket__grip" aria-hidden="true"></span>
    </div>
</li>
