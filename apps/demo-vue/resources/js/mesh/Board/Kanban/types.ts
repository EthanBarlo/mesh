export interface Card {
    id: string;
    title: string;
    tag: string;
}

export interface Column {
    id: string;
    title: string;
    cards: Card[];
}
