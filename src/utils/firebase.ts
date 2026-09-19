import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { BirthdayConfig } from '../types';
import { DEFAULT_CONFIG } from './storage';
import { AppEnvironment, getCurrentEnvironment } from './environment';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with custom databaseId if specified
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Document names for separation of Production and Development data
export const DOC_PRODUCTION = 'birthday_config_production';
export const DOC_DEVELOPMENT = 'birthday_config_dev';

// Legacy document name to migrate or fallback seamlessly
const DOC_LEGACY = 'birthday_config_live';

export function getDocumentNameForEnv(env?: AppEnvironment): string {
  const current = env || getCurrentEnvironment();
  return current === 'development' ? DOC_DEVELOPMENT : DOC_PRODUCTION;
}

/**
 * Fetch global config from Firestore for a specific environment (default: current environment)
 */
export async function getCloudBirthdayConfig(env?: AppEnvironment): Promise<BirthdayConfig | null> {
  const targetEnv = env || getCurrentEnvironment();
  const docName = getDocumentNameForEnv(targetEnv);

  try {
    const configDocRef = doc(db, 'settings', docName);
    const snap = await getDoc(configDocRef);
    if (snap.exists()) {
      return { ...DEFAULT_CONFIG, ...(snap.data() as Partial<BirthdayConfig>) };
    }

    // If production doc doesn't exist yet, check legacy doc to preserve previous saved data
    if (targetEnv === 'production') {
      const legacyRef = doc(db, 'settings', DOC_LEGACY);
      const legacySnap = await getDoc(legacyRef);
      if (legacySnap.exists()) {
        const legacyData = { ...DEFAULT_CONFIG, ...(legacySnap.data() as Partial<BirthdayConfig>) };
        // Auto-seed into production doc
        await setDoc(configDocRef, {
          ...legacyData,
          updatedAt: new Date().toISOString(),
          migratedFromLegacy: true,
        }, { merge: true });
        return legacyData;
      }
    } else if (targetEnv === 'development') {
      // If development doc doesn't exist yet, fallback to production doc or legacy doc as initial base
      const prodDocRef = doc(db, 'settings', DOC_PRODUCTION);
      const prodSnap = await getDoc(prodDocRef);
      if (prodSnap.exists()) {
        return { ...DEFAULT_CONFIG, ...(prodSnap.data() as Partial<BirthdayConfig>) };
      }
      const legacyRef = doc(db, 'settings', DOC_LEGACY);
      const legacySnap = await getDoc(legacyRef);
      if (legacySnap.exists()) {
        return { ...DEFAULT_CONFIG, ...(legacySnap.data() as Partial<BirthdayConfig>) };
      }
    }
  } catch (error) {
    console.warn(`Could not fetch cloud config for ${targetEnv} (offline or first run):`, error);
  }
  return null;
}

/**
 * Save birthday config to Firestore for a specific environment
 */
export async function saveCloudBirthdayConfig(
  config: BirthdayConfig,
  env?: AppEnvironment
): Promise<boolean> {
  const targetEnv = env || getCurrentEnvironment();
  const docName = getDocumentNameForEnv(targetEnv);

  try {
    const configDocRef = doc(db, 'settings', docName);
    const payload = JSON.parse(JSON.stringify(config));
    await setDoc(
      configDocRef,
      {
        ...payload,
        environment: targetEnv,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.error(`Failed to save config to Cloud Firestore (${targetEnv}):`, error);
    return false;
  }
}

/**
 * Subscribe to real-time changes for a specific environment
 */
export function subscribeToCloudBirthdayConfig(
  onUpdate: (config: BirthdayConfig) => void,
  env?: AppEnvironment
): () => void {
  const targetEnv = env || getCurrentEnvironment();
  const docName = getDocumentNameForEnv(targetEnv);

  try {
    const configDocRef = doc(db, 'settings', docName);
    return onSnapshot(
      configDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const cleanConfig = { ...DEFAULT_CONFIG, ...(data as Partial<BirthdayConfig>) };
          onUpdate(cleanConfig);
        }
      },
      (error) => {
        console.warn(`Realtime listener error for ${targetEnv}:`, error);
      }
    );
  } catch (e) {
    console.warn(`Could not start realtime listener for ${targetEnv}:`, e);
    return () => {};
  }
}

/**
 * DEPLOY OPERATION: Overwrite Production database with Development data
 * Returns { success: boolean, message: string }
 */
export async function deployDevToProduction(): Promise<{ success: boolean; message: string; config?: BirthdayConfig }> {
  try {
    // 1. Fetch current development config
    const devDocRef = doc(db, 'settings', DOC_DEVELOPMENT);
    const devSnap = await getDoc(devDocRef);

    let devData: BirthdayConfig;
    if (devSnap.exists()) {
      devData = { ...DEFAULT_CONFIG, ...(devSnap.data() as Partial<BirthdayConfig>) };
    } else {
      // If dev hasn't been saved yet, fetch current active dev state or fallback
      const fallback = await getCloudBirthdayConfig('development');
      if (fallback) {
        devData = fallback;
      } else {
        return {
          success: false,
          message: 'Data development belum ditemukan untuk di-deploy.',
        };
      }
    }

    // 2. Overwrite Production Document
    const prodDocRef = doc(db, 'settings', DOC_PRODUCTION);
    const payload = JSON.parse(JSON.stringify(devData));
    const deployTimestamp = new Date().toISOString();

    await setDoc(
      prodDocRef,
      {
        ...payload,
        environment: 'production',
        deployedAt: deployTimestamp,
        deployedFrom: 'development',
        updatedAt: deployTimestamp,
      },
      { merge: false } // Overwrite cleanly
    );

    // Also update legacy doc for complete backwards compatibility
    try {
      const legacyRef = doc(db, 'settings', DOC_LEGACY);
      await setDoc(
        legacyRef,
        {
          ...payload,
          updatedAt: deployTimestamp,
        },
        { merge: false }
      );
    } catch {
      // non-critical
    }

    return {
      success: true,
      message: 'Berhasil menimpa data Production dengan data Development! 🎉',
      config: devData,
    };
  } catch (err: any) {
    console.error('Error deploying Dev to Production:', err);
    return {
      success: false,
      message: `Gagal melakukan deploy: ${err?.message || 'Terjadi kesalahan sistem'}`,
    };
  }
}
