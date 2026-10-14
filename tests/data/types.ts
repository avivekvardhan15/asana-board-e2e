/**
 * Shape of one row in board-cases.json.
 * Keeping this type alongside the data file lets the data file remain
 * pure JSON (easy to edit, diff, or regenerate) while test code still
 * gets full type-checking on every property it reads.
 */
export interface BoardCase {
  /** Short stable identifier, used to build readable test names. */
  id: string;
  /** Sidebar project/board name, e.g. "Web Application". */
  project: string;
  /** Exact card title text to locate on the board. */
  cardTitle: string;
  /** Kanban column the card is expected to be in, e.g. "To Do". */
  column: string;
  /** All tag labels expected to be present on the card. */
  tags: string[];
}

export interface Credentials {
  username: string;
  password: string;
}
