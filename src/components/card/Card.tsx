import { StyleSheet, View, ViewProps } from "react-native";
import CardText from "../text/CardText";

type CardProps = ViewProps & {
    title: string;
};

export default function Card({ title, children }: CardProps) {
    return (
        <View style={styles.cardContainer}>
            <View style={styles.cardHeader}>
                <CardText variant="title">{title}</CardText>
            </View>
            <View style={styles.cardBody}>{children}</View>
        </View>
    );
}

const styles = StyleSheet.create({
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
    cardHeader: {
        borderBottomColor: "grey",
    },
    cardBody: {
        marginTop: 12,
        flexDirection: "row",
    },
});
