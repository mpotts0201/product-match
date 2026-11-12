import ResultsModal from '@/components/ResultsModal';
import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';


export default function App() {
  const [permission, requestPermission] = useCameraPermissions();

  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null)

  const handleScan = (result: BarcodeScanningResult) => {
    if (result && result?.data && !scannedBarcode) {
      console.log("Barcode: ", result.data)
      setScannedBarcode(result.data)
    } else {
      setScannedBarcode(null)
    }
  }

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera to scan barcodes</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ResultsModal reset={() => setScannedBarcode(null)} visible={!!scannedBarcode} barcode={scannedBarcode} />
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["upc_a", "upc_e", "ean13", "ean8"] }}
        onBarcodeScanned={scannedBarcode ? undefined : handleScan}
      />
      {!scannedBarcode ? 
        (
          <View style={styles.overlayContainer}>
            <Text style={styles.overlayText}>Scan a barcode</Text>
          </View>
        )
      : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  overlayContainer: {
    position: "absolute",
    top: 100,
    width: "100%",
    justifyContent: "center",
    alignItems: "center"
  },
  overlayText: {
    color: "white",
    fontSize: 20,
  }
});
