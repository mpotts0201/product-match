import { Image, StyleSheet, Text, View } from "react-native";

type ScannedProductProps = {
    product: any;
};

export default function ScannedProduct({ product }: ScannedProductProps) {
    return (
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
                    {product.allergens_tags.includes("en:gluten") ? "True" : "False"}
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
                    {product.labels_tags.includes("en:no-gluten") ? "True" : "False"}
                </Text>
            ) : null}
            <Text style={styles.modalSection}>Alternatives</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    modalSection: {
        fontSize: 20,
        fontWeight: 700,
    },
});
