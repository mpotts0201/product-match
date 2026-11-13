import { Image, Modal, ModalProps, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ResultsModalProps extends ModalProps {
  barcode: string | null;
  reset: () => void;
  product?: any;
}

export default function ResultsModal({ reset, visible, barcode, product }: ResultsModalProps) {
  return (
    <Modal visible={!!visible} animationType="slide" transparent onRequestClose={reset}>
      <View style={styles.modalRoot}>
        <View style={styles.sheet}>
          <View style={styles.modalHeader}>
            <Text>Barcode: {barcode}</Text>
            <TouchableOpacity onPress={reset}>
              <Text>X</Text>
            </TouchableOpacity>
          </View>
          <View>
            {product?.product?.product_name ? <Text>{product.product.product_name}</Text> : null}
            {product?.product?.image_url ? (
              <Image
                resizeMode="contain"
                width={300}
                height={300}
                source={{ uri: product.product.image_url }}
              />
            ) : null}
            {product?.product?.allergens_tags ? (
              <Text>
                Contains Gluten:{" "}
                {product.product.allergens_tags.includes("en:gluten") ? "True" : "False"}
              </Text>
            ) : null}
            {product?.product?.traces_tags ? (
              <Text>
                May Contain Traces of Gluten:{" "}
                {product.product.traces_tags.includes("en:gluten") ? "True" : "False"}
              </Text>
            ) : null}
            {product?.product?.labels_tags ? (
              <Text>
                Tagged as Gluen Free?:{" "}
                {product.product.labels_tags.includes("en:no-gluten") ? "True" : "False"}
              </Text>
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 24,
    paddingBottom: 48,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    gap: 12,
    height: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
