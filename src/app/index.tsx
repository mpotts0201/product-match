import ResultsModal from "@/components/modal/ResultsModal";
import useProductLookup from "@/hooks/useProductLookup";
import { BarcodeScanningResult, CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";

export default function App() {
    const [permission, requestPermission] = useCameraPermissions();

    const scanning = useRef(true);
    const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
    const { lookup, reset, error, product, alternatives, altsLoading, productLoading } =
        useProductLookup();

    const handleScan = async (result: BarcodeScanningResult) => {
        if (result && result?.data && scanning.current) {
            scanning.current = false;
            setScannedBarcode(result.data);
            await lookup(result.data);
        }
    };

    const resetScan = () => {
        setScannedBarcode(null);
        scanning.current = true;
        reset();
    };

    if (!permission) {
        // Camera permissions are still loading.
        return <View />;
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet.
        return (
            <View style={styles.container}>
                <Text style={styles.message}>
                    We need your permission to show the camera to scan barcodes
                </Text>
                <Button onPress={requestPermission} title="Grant Permission" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ResultsModal
                reset={resetScan}
                visible={!scanning.current}
                barcode={scannedBarcode}
                product={product}
                alternatives={alternatives}
                productLoading={productLoading}
                altsLoading={altsLoading}
            />
            <CameraView
                style={styles.camera}
                facing="back"
                barcodeScannerSettings={{ barcodeTypes: ["upc_a", "upc_e", "ean13", "ean8"] }}
                onBarcodeScanned={!scanning.current ? undefined : handleScan}
            />
            {scanning.current ? (
                <View style={styles.overlayContainer}>
                    <Text style={styles.overlayText}>Scan a barcode</Text>
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
    },
    message: {
        textAlign: "center",
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
        alignItems: "center",
    },
    overlayText: {
        color: "white",
        fontSize: 20,
    },
});
