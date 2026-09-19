import { BirthdayConfig } from '../types';
import { getCurrentEnvironment, AppEnvironment } from './environment';

export function getStorageKey(env?: AppEnvironment): string {
  const currentEnv = env || getCurrentEnvironment();
  return currentEnv === 'development'
    ? 'birthday_surprise_config_dev_v2'
    : 'birthday_surprise_config_prod_v2';
}

// Default preset memories with high quality Unsplash photos
export const DEFAULT_CONFIG: BirthdayConfig = {
  recipientName: 'Aurelia Catherine',
  senderName: 'LD',
  age: 24,
  birthDate: '2026-09-24T00:00:00.000Z', // 24 September 2026 00:00:00
  passcode: '2512',
  passcodeHint: 'XXXXXX',
  specialMessage: 'Happy Birthday LA❤️! Semoga di usiamu yang ke-24 ini membawa sejuta kebahagiaan, senyuman manis, dan semua impian indahmu menjadi kenyataan. Terima kasih telah hadir dan mewarnai setiap detik dalam hidupku. ✨💖',
  subMessage: 'Setiap senyumanmu adalah alasan mengapa hari-hariku menjadi jauh lebih indah.',
  wishText: '',
  audioTrackId: 'musicbox',
  themeId: 'emerald',
  adminPin: '2512',
  memories: [
    {
      id: 'mem-1',
      title: 'Momen Pertama Bersama',
      date: '12 Agustus 2023',
      imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop',
      caption: 'Hari pertama kita jalan dan ngobrol berjam-jam tanpa terasa waktu berputar begitu cepat.',
      tag: 'Kenangan Manis'
    },
    {
      id: 'mem-2',
      title: 'Kencan di Kafe Favorit',
      date: '25 November 2023',
      imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop',
      caption: 'Tertawa lepas sambil menikmati secangkir kopi hangat dan cerita konyol kita.',
      tag: 'Canda & Tawa'
    },
    {
      id: 'mem-3',
      title: 'Petualangan Liburan Kita',
      date: '14 Februari 2024',
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop',
      caption: 'Melihat matahari terbenam bersama di tepi pantai. Momen indah yang takkan pernah terlupakan.',
      tag: 'Liburan Romantis'
    },
    {
      id: 'mem-4',
      title: 'Senyuman Paling Manis',
      date: '20 Mei 2024',
      imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop',
      caption: 'Foto favoritku! Senyuman tulus yang selalu berhasil menenangkan hatiku.',
      tag: 'Favoritku'
    }
  ],
  vouchers: [
    {
      id: 'v-1',
      title: 'Voucher Jalan-jalan Gratis',
      description: 'Berlaku untuk kencan seharian penuh ke tempat impian pilihanmu!',
      iconName: 'Compass',
      code: 'DATE-NIGHT-2024',
      isClaimed: false
    },
    {
      id: 'v-2',
      title: 'Voucher Bebas Marah 1 Hari',
      description: 'Dapat digunakan sewaktu-waktu saat kamu mau diturutin semua kemauannya!',
      iconName: 'Smile',
      code: 'FREE-HAPPY-DAY',
      isClaimed: false
    },
    {
      id: 'v-3',
      title: 'Voucher Ice Cream & Coffee',
      description: 'Traktiran es krim dan kopi favoritmu tanpa batas!',
      iconName: 'Coffee',
      code: 'SWEET-TREATS',
      isClaimed: false
    }
  ]
};

export function encodeConfigToUrl(config: BirthdayConfig): string {
  try {
    const jsonStr = JSON.stringify(config);
    // Safe base64 encoding for Unicode
    const encoded = btoa(encodeURIComponent(jsonStr));
    const url = new URL(window.location.href);
    url.searchParams.set('c', encoded);
    return url.toString();
  } catch (e) {
    console.error('Failed to encode config to URL', e);
    return window.location.href;
  }
}

export function decodeConfigFromUrl(): BirthdayConfig | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('c') || params.get('data');
    if (!encoded) return null;
    const jsonStr = decodeURIComponent(atob(encoded));
    const parsed = JSON.parse(jsonStr);
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch (e) {
    console.error('Failed to decode config from URL', e);
    return null;
  }
}

export function loadBirthdayConfig(env?: AppEnvironment): BirthdayConfig {
  try {
    // 1. Priority: URL Parameter (Shared link from sender)
    const fromUrl = decodeConfigFromUrl();
    if (fromUrl) {
      saveBirthdayConfig(fromUrl, env);
      return fromUrl;
    }

    // 2. Local Storage by Environment
    const key = getStorageKey(env);
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.wishText && parsed.wishText.includes('Semoga di usia ke-24')) {
        parsed.wishText = '';
      }
      return { ...DEFAULT_CONFIG, ...parsed };
    }

    // Fallback to older storage key if migrating
    const legacySaved = localStorage.getItem('birthday_surprise_config_v1');
    if (legacySaved) {
      const parsed = JSON.parse(legacySaved);
      if (parsed.wishText && parsed.wishText.includes('Semoga di usia ke-24')) {
        parsed.wishText = '';
      }
      return { ...DEFAULT_CONFIG, ...parsed };
    }
  } catch (err) {
    console.error('Failed to parse saved config:', err);
  }
  return DEFAULT_CONFIG;
}

export function saveBirthdayConfig(config: BirthdayConfig, env?: AppEnvironment): void {
  try {
    const key = getStorageKey(env);
    localStorage.setItem(key, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save config:', err);
  }
}

export function resetBirthdayConfig(env?: AppEnvironment): BirthdayConfig {
  try {
    const key = getStorageKey(env);
    localStorage.removeItem(key);
  } catch (err) {
    console.error('Failed to reset config:', err);
  }
  return DEFAULT_CONFIG;
}
