import {
    Image,
    Modal,
    ModalProps,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

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
    const renderAlternatives = () => {
        return alternatives?.map((alt, i) => {
            return (
                <View key={alt.product_name + i}>
                    <Text>{alt.product_name}</Text>
                    <Image
                        resizeMode="contain"
                        width={300}
                        height={300}
                        source={{ uri: alt.image_url }}
                    />
                </View>
            );
        });
    };

    return (
        <Modal visible={!!visible} animationType="slide" transparent onRequestClose={reset}>
            <View style={styles.modalRoot}>
                <View style={styles.sheet}>
                    <View style={styles.modalHeader}>
                        <Text>Barcode: {barcode}</Text>
                        <TouchableOpacity onPress={reset}>
                            <Text>X</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView>
                        <View>
                            <Text style={styles.modalSection}>Product Information</Text>
                            {product?.product_name ? <Text>{product.product_name}</Text> : null}
                            {product?.image_url ? (
                                <Image
                                    resizeMode="contain"
                                    width={300}
                                    height={300}
                                    source={{ uri: product.image_url }}
                                />
                            ) : null}
                            {product?.allergens_tags ? (
                                <Text>
                                    Contains Gluten:{" "}
                                    {product.allergens_tags.includes("en:gluten")
                                        ? "True"
                                        : "False"}
                                </Text>
                            ) : null}
                            {product?.traces_tags ? (
                                <Text>
                                    May Contain Traces of Gluten:{" "}
                                    {product.traces_tags.includes("en:gluten") ? "True" : "False"}
                                </Text>
                            ) : null}
                            {product?.labels_tags ? (
                                <Text>
                                    Tagged as Gluen Free?:{" "}
                                    {product.labels_tags.includes("en:no-gluten")
                                        ? "True"
                                        : "False"}
                                </Text>
                            ) : null}
                        </View>
                        <View>
                            <Text style={styles.modalSection}>Alternatives</Text>
                            {renderAlternatives()}
                        </View>
                    </ScrollView>
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
    modalSection: {
        fontSize: 20,
        fontWeight: 700,
    },
});
