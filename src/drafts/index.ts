import { Directory, File, Paths } from 'expo-file-system';
import { createDraftStore, type DraftIO } from './store';

/**
 * Where unsealed drafts live on the device.
 *
 * Not expo-secure-store: on Android it is backed by EncryptedSharedPreferences
 * and values above ~2 KB are rejected, while a night's note may run to 5 000
 * characters. Not the cache directory either — the OS may clear it, and the
 * whole point is surviving a restart.
 *
 * So: the app's private cache directory, which no other app can read on a
 * non-rooted device and which iOS excludes from device backups. The OS may
 * reclaim a cache under storage pressure, but that is a safer failure mode
 * than silently copying unsealed writing into a cloud backup. Android backup
 * is disabled at the app level as a second boundary.
 */
const DIRECTORY_NAME = 'unsealed-drafts';

function draftsDirectory(): Directory {
  const directory = new Directory(Paths.cache, DIRECTORY_NAME);
  if (!directory.exists) directory.create({ intermediates: true, idempotent: true });
  return directory;
}

const fileSystemIO: DraftIO = {
  async read(name) {
    const file = new File(draftsDirectory(), name);
    if (!file.exists) return null;
    return file.text();
  },
  async write(name, contents) {
    const file = new File(draftsDirectory(), name);
    if (!file.exists) file.create();
    file.write(contents);
  },
  async remove(name) {
    const file = new File(draftsDirectory(), name);
    if (file.exists) file.delete();
  },
  async list() {
    const directory = draftsDirectory();
    if (!directory.exists) return [];
    return directory.list().map((entry) => entry.name);
  },
};

export const drafts = createDraftStore(fileSystemIO);

export { createDraftStore, draftFileName, isValidScope } from './store';
export type { DraftScope, DraftIO, DraftStore } from './store';
