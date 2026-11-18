import Ionicons from "@expo/vector-icons/Ionicons";
import {
    FlatList,
    ListRenderItem,
    Modal,
    ModalProps,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import ProductListResult from "../product/ProductListResult";
import ScannedProduct from "../product/ScannedProduct";

interface ResultsModalProps extends ModalProps {
    barcode: string | null;
    reset: () => void;
    product?: any;
    alternatives?: any[];
}

export default function ResultsModal({
    reset,
    visible,
    barcode,
    product,
    alternatives,
}: ResultsModalProps) {
    const renderAlternatives: ListRenderItem<any> = ({ item }) => {
        return <ProductListResult item={item} />;
    };

    const renderScannedProduct = () => {
        return <ScannedProduct product={product} />;
    };

    return (
        <Modal visible={!!visible} animationType="slide" transparent onRequestClose={reset}>
            <View style={styles.modalRoot}>
                <View style={styles.sheet}>
                    <View style={styles.modalHeader}>
                        <Text>Barcode: {barcode}</Text>
                        <TouchableOpacity onPress={reset} hitSlop={12}>
                            <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={alternatives}
                        ListHeaderComponent={renderScannedProduct}
                        renderItem={renderAlternatives}
                    />
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalRoot: {
        flex: 1,
        justifyContent: "flex-end",
    },
    sheet: {
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        padding: 24,
        paddingBottom: 48,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        gap: 12,
        height: "80%",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
});
