import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { AntDesign } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"

function NavBar({ title }) {
  const navigation = useNavigation()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.rightButtons}>
        <TouchableOpacity onPress={() => navigation.navigate("Profile")} style={styles.button}>
          <AntDesign name="user" size={22} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 50,
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  title: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 5,
  },
  rightButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  button: {
    padding: 5,
    marginTop: 5,
    marginLeft: 8,
  },
})

export default NavBar
