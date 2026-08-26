/**
 * Local recovery for writing that has not been sealed yet.
 *
 * Pure and storage-agnostic on purpose: the isolation rules are the whole
 * point of this file, and they are worth testing without a device.
 *
 * Nothing here logs. A draft is the most private thing in the product, so its
 * contents never enter a message, a file name, or an error.
 */

export type DraftScope = {
  /** The signed-in account. 0 means "not known yet" and is never written. */
  userId: number;
  /** Which of the 21 nights this draft belongs to. */
  night: number;
};

export type DraftIO = {
  read(name: string): Promise<string | null>;
  write(name: string, contents: string): Promise<void>;
  remove(name: string): Promise<void>;
  list(): Promise<string[]>;
};

const PREFIX = 'night-';
const SUFFIX = '.txt';

function isWholeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && Number.isFinite(value);
}

/**
 * A draft is only ever stored against a known account and a real night.
 * Without this, everyone whose id defaulted to 0 would share one file.
 */
export function isValidScope(scope: DraftScope | null | undefined): boolean {
  if (!scope) return false;
  return (
    isWholeNumber(scope.userId) &&
    scope.userId > 0 &&
    isWholeNumber(scope.night) &&
    scope.night > 0
  );
}

/** The file name carries the scope and nothing else — never any of the text. */
export function draftFileName(scope: DraftScope): string | null {
  if (!isValidScope(scope)) return null;
  return `${PREFIX}${scope.userId}-${scope.night}${SUFFIX}`;
}

export function isDraftFileName(name: string): boolean {
  return name.startsWith(PREFIX) && name.endsWith(SUFFIX);
}

export function createDraftStore(io: DraftIO) {
  /**
   * Every method swallows storage errors. A device that cannot write to disk
   * is a reason to lose autosave, never a reason to stop someone writing.
   */
  async function load(scope: DraftScope): Promise<string | null> {
    const name = draftFileName(scope);
    if (!name) return null;
    try {
      const text = await io.read(name);
      return text && text.length > 0 ? text : null;
    } catch {
      return null;
    }
  }

  async function save(scope: DraftScope, text: string): Promise<boolean> {
    const name = draftFileName(scope);
    if (!name) return false;
    // An emptied editor is a discard, not a draft worth keeping on disk.
    if (!text.trim()) {
      await discard(scope);
      return false;
    }
    try {
      await io.write(name, text);
      return true;
    } catch {
      return false;
    }
  }

  /** Called the moment a note is sealed, and when the writer clears it. */
  async function discard(scope: DraftScope): Promise<void> {
    const name = draftFileName(scope);
    if (!name) return;
    try {
      await io.remove(name);
    } catch {
      /* already gone, or unwritable: nothing else to do */
    }
  }

  /** Called on sign-out, so the next account never sees the last one's work. */
  async function discardAll(): Promise<void> {
    try {
      const names = await io.list();
      await Promise.all(
        names.filter(isDraftFileName).map((name) => io.remove(name).catch(() => {})),
      );
    } catch {
      /* nothing listable means nothing to clear */
    }
  }

  return { load, save, discard, discardAll };
}

export type DraftStore = ReturnType<typeof createDraftStore>;
