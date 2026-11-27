import CardText from "@/components/text/CardText";
import { filterGenericTags } from "@/lib/alternativesFilter";
import { StyleSheet, TouchableOpacity, View } from "react-native";

type IngredientsSelectionProps = {
    ingredients: string[];
    selectedIngredients: string[];
    onPress: (selection: string) => void;
};

export default function IngredientsSelection({
    ingredients,
    selectedIngredients,
    onPress,
}: IngredientsSelectionProps) {
    const renderSelections = () => {
        return filterGenericTags(ingredients).map((ing, i) => {
            const selected = selectedIngredients.includes(ing);
            return (
                <TouchableOpacity
                    key={ing + i}
                    style={selected ? styles.ingredientPillSelected : styles.ingredientPillDefault}
                    onPress={() => onPress(ing)}
                >
                    <CardText variant="body">{ing.split(":").pop()}</CardText>
                </TouchableOpacity>
            );
        });
    };
    return (
        <>
            <CardText variant="title">Ingredients</CardText>
            <View style={styles.selectionContainer}>{renderSelections()}</View>
        </>
    );
}

const styles = StyleSheet.create({
    selectionContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    ingredientPillDefault: {
        borderRadius: 15,
        borderWidth: 1,
        borderColor: "grey",
        backgroundColor: "white",
        margin: 2,
        padding: 4,
        paddingHorizontal: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    ingredientPillSelected: {
        borderRadius: 15,
        borderWidth: 2,
        borderColor: "green",
        backgroundColor: "white",
        margin: 2,
        padding: 4,
        paddingHorizontal: 8,
        alignItems: "center",
        justifyContent: "center",
    },
});
