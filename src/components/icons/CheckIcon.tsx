import Ionicons from "@expo/vector-icons/Ionicons";
import { View } from "react-native";

export default function CheckIcon() {
    return (
        <View
            style={{
                borderRadius: 50,
                backgroundColor: "#2e7d32",
                width: 15,
                height: 15,
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <Ionicons name="checkmark" size={10} color="#fff" />
        </View>
    );
}
