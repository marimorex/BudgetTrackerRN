import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../src/db/database';

export default function SettingsScreen() {
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = async () => {
    try {
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert('Sharing is not available on this platform.');
        return;
      }

      const docDir = FileSystem.documentDirectory ?? '';
      const sqliteDir = `${docDir}SQLite`;
      await FileSystem.makeDirectoryAsync(sqliteDir, { intermediates: true });

      const dbUri = `${sqliteDir}/budgettracker.db`;
      const info = await FileSystem.getInfoAsync(dbUri);
      if (!info.exists) {
        Alert.alert('Export failed', 'Database file not found.');
        return;
      }
      if ((info.size ?? 0) < 1000) {
        Alert.alert('Export failed', 'Database file looks empty or invalid.');
        return;
      }

      const stamp = new Date().toISOString().slice(0, 10);
      const exportUri = `${docDir}BudgetTracker-${stamp}.db`;

      const exportInfo = await FileSystem.getInfoAsync(exportUri);
      if (exportInfo.exists) {
        await FileSystem.deleteAsync(exportUri, { idempotent: true });
      }

      await FileSystem.copyAsync({ from: dbUri, to: exportUri });
      if (__DEV__) {
        console.log('Exported DB', { from: dbUri, to: exportUri, size: info.size ?? 0 });
      }

      await Sharing.shareAsync(exportUri, {
        mimeType: 'application/x-sqlite3',
        UTI: 'public.database',
        dialogTitle: 'Export BudgetTracker Database',
      });
    } catch (e: any) {
      console.error(e);
      Alert.alert('Export failed', e?.message ?? 'Unknown error');
    }
  };

  const handleImport = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
    });

    if (result.canceled) return;

    const asset = result.assets?.[0];
    if (!asset?.uri) return;

    const docDir = FileSystem.documentDirectory ?? '';
    const dbUri = `${docDir}SQLite/budgettracker.db`;

    try {
      await FileSystem.makeDirectoryAsync(
        `${docDir}SQLite`,
        { intermediates: true }
      );

      const name = asset.name?.toLowerCase() ?? '';
      if (
        name &&
        !name.endsWith('.db') &&
        !name.endsWith('.sqlite') &&
        !name.endsWith('.sqlite3')
      ) {
        throw new Error('Please select a .db / .sqlite file.');
      }

      const info = await FileSystem.getInfoAsync(asset.uri);
      if (!info.exists || (info.size ?? 0) < 1000) {
        throw new Error("Selected file doesn't look like a valid database.");
      }

      const proceed = await new Promise<boolean>((resolve) => {
        Alert.alert(
          'Replace current data?',
          'Importing will overwrite your existing data.',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Replace', style: 'destructive', onPress: () => resolve(true) },
          ]
        );
      });

      if (!proceed) return;

      setIsImporting(true);

      try {
        db?.closeSync?.();
      } catch {}

      if (__DEV__) {
        console.log('Importing DB', {
          from: asset.uri,
          to: dbUri,
          size: info.size ?? 0,
        });
      }

      await FileSystem.copyAsync({
        from: asset.uri,
        to: dbUri,
      });

      const newInfo = await FileSystem.getInfoAsync(dbUri);
      if (__DEV__) {
        console.log('Imported DB info', newInfo);
      }

      Alert.alert('Import complete', 'Please restart the app to load the new data.');
    } catch (e: any) {
      console.error(e);
      Alert.alert('Import failed', e?.message ?? 'Unknown error');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.buttonContainer}>
        <Pressable onPress={handleExport} style={styles.button}>
          <Text style={styles.buttonText}>Export Data</Text>
        </Pressable>
        <Pressable onPress={handleImport} style={styles.button}>
          <Text style={styles.buttonText}>Import Data</Text>
        </Pressable>
      </View>

      <Modal transparent={true} animationType="fade" visible={isImporting}>
        <View style={styles.modalContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.modalText}>Importing data...</Text>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    backgroundColor: 'blue',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalText: {
    color: 'white',
    marginTop: 12,
    fontSize: 16,
  },
});
