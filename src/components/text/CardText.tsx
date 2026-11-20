import { StyleSheet, Text, TextProps } from "react-native";

type CardTextProps = TextProps & {
    variant?: "title" | "body";
};

export default function CardText({ variant = "body", children, style }: CardTextProps) {
    return <Text style={[styles[variant], style]}>{children}</Text>;
}

const fontColor = { color: "rgba(0, 0, 0, 0.7)" };

const styles = StyleSheet.create({
    body: {
        ...fontColor,
        fontSize: 12,
        fontWeight: 500,
        paddingBottom: 6,
    },
    title: {
        ...fontColor,
        fontSize: 16,
        fontWeight: 600,
        marginBottom: 12,
        marginRight: 6,
    },
});
