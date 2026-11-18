import Ionicons from "@expo/vector-icons/Ionicons";
import { View } from "react-native";

export default function CheckIcon() {
    return (
        <View
            style={{
                borderRadius: 50,
                backgroundColor: "#c20000",
                width: 15,
                height: 15,
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <Ionicons name="close" size={10} color="#fff" />
        </View>
    );
}
