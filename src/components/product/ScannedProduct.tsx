import { Image, StyleSheet, Text, View } from "react-native";
import Card from "../card/Card";
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
            <Card title={product.product_name} expandedToggleable={false}>
                <View style={styles.cardLeft}>
                    {product?.image_url ? (
                        <Image
                            style={{ borderRadius: 150 }}
                            resizeMode="cover"
                            width={100}
                            height={100}
                            source={{ uri: product?.image_url }}
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
            </Card>
            <Text style={styles.modalSection}>Alternative Products</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    modalSection: {
        fontSize: 20,
        fontWeight: 700,
    },
    cardLeft: {
        width: "40%",
    },
    cardRight: {
        width: "60%",
    },
});
