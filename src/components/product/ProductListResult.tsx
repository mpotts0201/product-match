import { Image, Text } from "react-native";
import Card from "../card/Card";

type ProductListResultProps = {
    item: any;
};

export default function ProductListResult({ item }: ProductListResultProps) {
    return (
        <Card title={item.product_name}>
            <Text>{item.product_name}</Text>
            <Image resizeMode="contain" width={300} height={300} source={{ uri: item.image_url }} />
        </Card>
    );
}
