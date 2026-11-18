import Ionicons from "@expo/vector-icons/Ionicons";
import {
    ActivityIndicator,
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
    productLoading: boolean;
    altsLoading: boolean;
}

export default function ResultsModal({
    reset,
    visible,
    barcode,
    product,
    alternatives,
    productLoading,
    altsLoading,
}: ResultsModalProps) {
    const renderAlternatives: ListRenderItem<any> = ({ item }) => {
        return altsLoading ? <ActivityIndicator /> : <ProductListResult item={item} />;
    };

    const renderScannedProduct = () => {
        return productLoading ? <ActivityIndicator /> : <ScannedProduct product={product} />;
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
                        contentContainerStyle={styles.flatlistContainer}
                        data={alternatives}
                        ListHeaderComponent={renderScannedProduct}
                        renderItem={renderAlternatives}
                        // scrollIndicatorInsets={}
                    />
                </View>
            </View>
        </Modal>
    );
}

const padding = { paddingLeft: 24, paddingRight: 24 };

const styles = StyleSheet.create({
    modalRoot: {
        flex: 1,
        justifyContent: "flex-end",
        width: "100%",
    },
    sheet: {
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        paddingTop: 24,
        paddingBottom: 48,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        gap: 12,
        height: "80%",
        width: "100%",
    },
    modalHeader: {
        ...padding,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    flatlistContainer: {
        ...padding,
        alignSelf: "stretch",
        width: "100%",
    },
});
