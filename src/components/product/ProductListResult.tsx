import { Image, Text, View } from "react-native";

type ProductListResultProps = {
    item: any;
};

export default function ProductListResult({ item }: ProductListResultProps) {
    return (
        <View>
            <Text>{item.product_name}</Text>
            <Image resizeMode="contain" width={300} height={300} source={{ uri: item.image_url }} />
        </View>
    );
}
