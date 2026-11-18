import { Image, StyleSheet, Text, View } from "react-native";
import CancelIcon from "../icons/CancelIcon";
import CheckIcon from "../icons/CheckIcon";
import CardText from "../text/CardText";

type ScannedProductProps = {
    product: any;
};

export default function ScannedProduct({ product }: ScannedProductProps) {
    return (
        <View>
            <Text style={styles.modalSection}>Scanned Product</Text>
            <View style={styles.cardContainer}>
                <View style={styles.cardHeader}>
                    {product?.product_name ? (
                        <CardText variant="title">{product.product_name}</CardText>
                    ) : null}
                </View>
                <View style={styles.cardBody}>
                    <View style={styles.cardLeft}>
                        {product?.image_url ? (
                            <Image
                                style={{ borderRadius: 150 }}
                                resizeMode="cover"
                                width={100}
                                height={100}
                                source={{ uri: product.image_url }}
                            />
                        ) : null}
                    </View>
                    <View style={styles.cardRight}>
                        {product?.allergens_tags ? (
                            <CardText variant="body">
                                {product.allergens_tags.includes("en:gluten") ? (
                                    <CancelIcon />
                                ) : (
                                    <CheckIcon />
                                )}
                                Nutritionally Gluten Free{" "}
                            </CardText>
                        ) : null}
                        {product?.traces_tags ? (
                            <CardText variant="body">
                                {product.traces_tags.includes("en:gluten") ? (
                                    <CancelIcon />
                                ) : (
                                    <CheckIcon />
                                )}
                                No Gluten Traces Contamination{" "}
                            </CardText>
                        ) : null}
                        {product?.labels_tags ? (
                            <CardText variant="body">
                                {product.labels_tags.includes("en:no-gluten") ? (
                                    <CheckIcon />
                                ) : (
                                    <CancelIcon />
                                )}
                                Labeled as Gluten Free{" "}
                            </CardText>
                        ) : null}
                    </View>
                </View>
            </View>
            <Text style={styles.modalSection}>Alternative Products</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    modalSection: {
        fontSize: 20,
        fontWeight: 700,
    },
    cardContainer: {
        flexDirection: "column",
        marginTop: 30,
        marginBottom: 30,
        padding: 12,
        borderRadius: 8,
        backgroundColor: "white",
        // iOS
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        // Android
        elevation: 4,
    },
    cardBodyText: {
        // alignItems: "center",
        justifyContent: "center",
    },
    cardHeader: {
        // marginBottom: 8,
        // borderBottomWidth: 1,
        borderBottomColor: "grey",
    },
    cardLeft: {
        width: "40%",
    },
    cardRight: {
        width: "60%",
    },
    cardBody: {
        marginTop: 12,
        flexDirection: "row",
    },
});
