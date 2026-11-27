import { Product } from "@/types/product";
import { Image, StyleSheet, TouchableOpacity } from "react-native";
import CardText from "../text/CardText";

type ProductPillProps = {
    product?: Product | null;
    onPress: any;
};

export default function ProductPill({ product, onPress }: ProductPillProps) {
    return (
        <TouchableOpacity onPress={onPress} style={styles.container}>
            <Image
                style={styles.image}
                width={30}
                height={30}
                resizeMode="center"
                source={{ uri: product?.imageUrl }}
            />
            <CardText style={{ marginHorizontal: 10 }} variant="title">
                {product?.name}
            </CardText>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        borderRadius: 150,
        backgroundColor: "white",
        justifyContent: "space-between",
        alignItems: "center",
        alignSelf: "center",
        padding: 8,
        // iOS
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        // Android
        elevation: 4,
    },
    image: {
        borderRadius: 150,
    },
});
