import { Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { exportMyData } from '../api/safety';

/**
 * The file on device that carries an export while the share sheet is open.
 *
 * A stable filename — not dated — is deliberate. The previous filename cycled
 * daily, so every export left the last one behind and a device accumulated
 * plaintext journals over time. A fixed name means at most one copy of the
 * unencrypted export exists in the app cache at any moment, and the next
 * export overwrites it before writing anything new.
 */
const EXPORT_FILENAME = 'mentally-prepare-data.json';

export async function prepareAndShareDataExport(): Promise<'shared' | 'unavailable'> {
  // The web `Share.share({message: ...})` branch used to push the whole
  // journal as the body of the share sheet's message — meaning it was
  // handed as text to whatever recipient app the user picked (Slack, email,
  // Twitter compose window). Any browser can already download JSON through
  // the account settings on the website; a mobile-web fallback that leaks
  // the whole journal into a compose field is worse than no export at all.
  if (Platform.OS === 'web') return 'unavailable';

  if (!(await Sharing.isAvailableAsync())) return 'unavailable';

  const data = await exportMyData();
  const content = JSON.stringify(data, null, 2);

  const file = new File(Paths.cache, EXPORT_FILENAME);
  if (file.exists) file.delete();
  file.create();
  file.write(content);

  try {
    await Sharing.shareAsync(file.uri, {
      dialogTitle: 'Save or share your Mentally Prepare data',
      mimeType: 'application/json',
      UTI: 'public.json',
    });
    return 'shared';
  } catch (err) {
    // The share failed — the recipient never got to read the file, so
    // nothing is depending on it. Delete the plaintext now rather than
    // leaving it behind on a failure the user did not see.
    if (file.exists) {
      try {
        file.delete();
      } catch {
        // best-effort cleanup; a failure here is not worth propagating
      }
    }
    throw err;
  }
  // The success path deliberately leaves the file: on Android the share
  // sheet hands the recipient a content:// URI backed by this cache file
  // and the recipient may read it after shareAsync resolves. Deleting here
  // would race the read. The next export overwrites it (fixed filename).
}
