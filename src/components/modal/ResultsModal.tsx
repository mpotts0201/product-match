import { filterGenericTags } from "@/lib/alternativesFilter";
import { Product as ProductType } from "@/types/product";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    LayoutAnimation,
    ListRenderItem,
    ListViewToken,
    Modal,
    ModalProps,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import IngredientsSelection from "../product/IngredientsSelection";
import Product from "../product/Product";
import ProductPill from "../product/ProductPill";
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
    const flatListRef = useRef<FlatList<ProductType>>(null);
    const [pillVisible, setPillVisible] = useState<boolean>(false);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    function onViewableItemsChanged(info: { viewableItems: ListViewToken[] }) {
        const firstItemViewable = info.viewableItems.find((item) => item.index === 0);
        const secondItemViewable = info.viewableItems.find((item) => item.index === 1);
        if (firstItemViewable && pillVisible) {
            setPillVisible(false);
        } else if (secondItemViewable && !firstItemViewable && !pillVisible) {
            setPillVisible(true);
        }
    }
    const renderAlternatives: ListRenderItem<any> = ({ item }) => {
        return altsLoading ? <ActivityIndicator /> : <Product product={item} expandedToggleable />;
    };

    const [ingredientSelections, setIngredientSelections] = useState<string[]>([]);

    useEffect(() => {
        const firstIng = filterGenericTags(product?.ingredientTags ?? [])[0];
        setIngredientSelections([firstIng]);
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
            <View style={styles.scannedProductContainer}>
                <Text style={styles.modalSection}>Scanned Product</Text>
                <Text>Barcode: {barcode}</Text>
                <Product isMainProduct product={product} expandedToggleable={false} />
                {!!product && !!product.ingredientTags ? (
                    <IngredientsSelection
                        selectedIngredients={ingredientSelections}
                        ingredients={product.ingredientTags}
                        onPress={handleSelectIngredient}
                    />
                ) : null}
                <Text style={styles.modalSection}>Alternative Products</Text>
                <CardText variant="subtitle" style={{ marginBottom: 15 }}>
                    Matched Category - {product.category?.split(":").pop()}
                </CardText>
            </View>
        );
    };

    const handlePillPress = () => {
        flatListRef?.current?.scrollToOffset({ offset: 0, animated: true });
    };

    return (
        <Modal visible={!!visible} animationType="slide" transparent onRequestClose={reset}>
            <View style={styles.modalRoot}>
                <View style={styles.sheet}>
                    {pillVisible ? (
                        <View style={styles.productPillPosition}>
                            <ProductPill onPress={handlePillPress} product={product} />
                        </View>
                    ) : null}
                    <View style={styles.closeIconPosition}>
                        <TouchableOpacity onPress={reset} hitSlop={12}>
                            <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        ref={flatListRef}
                        contentContainerStyle={styles.flatlistContainer}
                        data={filterAlts()}
                        ListHeaderComponent={renderScannedProduct}
                        renderItem={renderAlternatives}
                        onViewableItemsChanged={onViewableItemsChanged}
                        viewabilityConfig={{ itemVisiblePercentThreshold: 100 }}
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
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        gap: 12,
        height: "80%",
        width: "100%",
    },
    productPillPosition: {
        position: "absolute",
        top: 15,
        left: 15,
        zIndex: 5,
    },
    closeIconPosition: {
        position: "absolute",
        top: 15,
        right: 15,
        zIndex: 5,
    },
    scannedProductContainer: {
        marginTop: 24,
    },
    modalHeaderInfo: {
        flexDirection: "column",
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
