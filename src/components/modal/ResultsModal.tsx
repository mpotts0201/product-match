import { Product as ProductType } from "@/types/product";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useState } from "react";
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
import IngredientsSelection from "../product/IngredientsSelection";
import Product from "../product/Product";
import CardText from "../text/CardText";

interface ResultsModalProps extends ModalProps {
    barcode: string | null;
    reset: () => void;
    product?: ProductType | null;
    alternatives?: ProductType[];
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
        return altsLoading ? <ActivityIndicator /> : <Product product={item} expandedToggleable />;
    };

    const [ingredientSelections, setIngredientSelections] = useState<string[]>([]);

    useEffect(() => {
        setIngredientSelections(product?.mainIngredient ? [product.mainIngredient] : []);
    }, [product?.code]);

    const handleSelectIngredient = (selection: string) => {
        if (ingredientSelections.includes(selection)) {
            const newSelections = ingredientSelections.filter((ing: string) => ing != selection);
            setIngredientSelections(newSelections);
        } else {
            const newSelections = [...ingredientSelections, selection];
            setIngredientSelections(newSelections);
        }
    };

    const filterAlts = () => {
        return alternatives?.filter((alt) => {
            return ingredientSelections.every((ing) => alt.ingredientTags.includes(ing));
        });
    };

    const renderScannedProduct = () => {
        return productLoading || !product ? (
            <ActivityIndicator />
        ) : (
            <>
                <Text style={styles.modalSection}>Scanned Product</Text>
                <Product isMainProduct product={product} expandedToggleable={false} />
                <Text style={styles.modalSection}>Alternative Products</Text>
                <CardText variant="subtitle" style={{ marginTop: 15 }}>
                    Matched Category - {product.category?.split(":").pop()}
                </CardText>
                {!!product && !!product.ingredientSelections ? (
                    <IngredientsSelection
                        selectedIngredients={ingredientSelections}
                        ingredients={product.ingredientSelections}
                        onPress={handleSelectIngredient}
                    />
                ) : null}
            </>
        );
    };

    console.log("main:", product?.mainIngredient);
    console.log("selected:", ingredientSelections);
    console.log("first alt tags:", alternatives?.[0]?.ingredientTags?.slice(0, 8));
    console.log("filtered count:", filterAlts()?.length, "of", alternatives?.length);

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
                        data={filterAlts()}
                        ListHeaderComponent={renderScannedProduct}
                        renderItem={renderAlternatives}
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
    modalSection: {
        fontSize: 20,
        fontWeight: 700,
    },
    flatlistContainer: {
        ...padding,
        alignSelf: "stretch",
        width: "100%",
    },
});
