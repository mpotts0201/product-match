import { Modal, ModalProps, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ResultsModalProps extends ModalProps {
  barcode: string | null;
  reset: () => void;
}

export default function ResultsModal({ reset, visible, barcode }: ResultsModalProps) {
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
