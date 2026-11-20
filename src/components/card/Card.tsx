import { useState } from "react";
import { LayoutAnimation, Pressable, StyleSheet, Text, View, ViewProps } from "react-native";
import CardText from "../text/CardText";

type CardProps = ViewProps & {
    title: string;
    expandedToggleable?: boolean;
};

export default function Card({ title, children, expandedToggleable = true }: CardProps) {
    const [expanded, setExpanded] = useState<boolean>(!expandedToggleable);

    function toggleExpanded() {
        if (expandedToggleable) {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setExpanded((e) => !e);
        }
    }

    return (
        <Pressable style={styles.cardContainer} onPress={toggleExpanded}>
            <View>
                <CardText variant="title">{title}</CardText>
            </View>
            <View style={styles.cardBody}>{children}</View>
            {expanded ? (
                <View>
                    <Text>Expanded Content</Text>
                </View>
            ) : null}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        flexDirection: "column",
        marginTop: 15,
        marginBottom: 15,
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
    cardBody: {
        flexDirection: "row",
    },
});
