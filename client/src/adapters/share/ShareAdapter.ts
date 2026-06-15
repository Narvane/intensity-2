import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';

export async function shareInviteContent(message: string, url: string): Promise<'shared' | 'copied'> {
  if (Capacitor.isNativePlatform()) {
    await Share.share({
      title: 'Intensity',
      text: message,
      url,
      dialogTitle: message,
    });
    return 'shared';
  }

  if (typeof navigator.share === 'function') {
    await navigator.share({
      title: 'Intensity',
      text: message,
      url,
    });
    return 'shared';
  }

  await navigator.clipboard.writeText(`${message}\n${url}`);
  return 'copied';
}
