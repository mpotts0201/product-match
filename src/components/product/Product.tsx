import { Image, StyleSheet, View, ViewProps } from "react-native";
import Card from "../card/Card";
import CancelIcon from "../icons/CancelIcon";
import CheckIcon from "../icons/CheckIcon";
import CardText from "../text/CardText";

type ProductProps = {
    product: any;
    expandedToggleable: boolean;
};

type CardLineProps = ViewProps & {
    includes: boolean;
    text: string;
};

function CardLine({ includes, text }: CardLineProps) {
    return (
        <View style={styles.cardLine}>
            {includes ? <CheckIcon /> : <CancelIcon />}
            <CardText style={styles.cardText} variant="body">
                {text}
            </CardText>
        </View>
    );
}

export default function Product({ product, expandedToggleable }: ProductProps) {
    return (
        <Card title={product.product_name} expandedToggleable={expandedToggleable}>
            <View style={styles.cardLeft}>
                {product?.image_url ? (
                    <Image
                        style={{ borderRadius: 15 }}
                        resizeMode="cover"
                        width={100}
                        height={100}
                        source={{ uri: product.image_url }}
                    />
                ) : null}
            </View>
            <View style={styles.cardRight}>
                {product?.allergens_tags ? (
                    <CardLine
                        includes={!product.allergens_tags.includes("en:gluten")}
                        text="Nutritionally Gluten Free"
                    />
                ) : null}
                {product?.traces_tags ? (
                    <CardLine
                        includes={!product.traces_tags.includes("en:gluten")}
                        text="No Gluten Traces Contamination"
                    />
                ) : null}
                {product?.labels_tags ? (
                    <CardLine
                        includes={product.labels_tags.includes("en:no-gluten")}
                        text="Labeled as Gluten Free"
                    />
                ) : null}
            </View>
        </Card>
    );
}

const styles = StyleSheet.create({
    cardLeft: {
        width: "40%",
    },
    cardRight: {
        width: "60%",
    },
    cardLine: {
        flexDirection: "row",
        marginTop: 3,
    },
    cardText: {
        wordWrap: "wrap",
        marginLeft: 3,
    },
});
