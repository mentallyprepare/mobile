import { Platform, Share } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { exportMyData } from '../api/safety';

export async function prepareAndShareDataExport(): Promise<'shared' | 'unavailable'> {
  const data = await exportMyData();
  const content = JSON.stringify(data, null, 2);

  if (Platform.OS === 'web') {
    await Share.share({
      title: 'My Mentally Prepare data',
      message: content,
    });
    return 'shared';
  }

  if (!(await Sharing.isAvailableAsync())) return 'unavailable';

  const date = new Date().toISOString().slice(0, 10);
  const file = new File(Paths.cache, `mentally-prepare-data-${date}.json`);
  if (file.exists) file.delete();
  file.create();
  file.write(content);
  await Sharing.shareAsync(file.uri, {
    dialogTitle: 'Save or share your Mentally Prepare data',
    mimeType: 'application/json',
    UTI: 'public.json',
  });
  return 'shared';
}
