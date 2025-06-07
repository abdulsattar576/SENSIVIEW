import React, { useContext,useState,useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import * as ImagePicker from "react-native-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useGetLoggedUserQuery } from "../../services/UserAuthApi";
import { getToken } from "../../services/AsyncStorageService";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../../../App";

const Account = () => {
  const navigation = useNavigation();
  const { handleLogout } = useContext(AuthContext);
  const [token, setToken] = useState(null);
  const [profileImage, setProfileImage] = useState(
    "https://randomuser.me/api/portraits/men/1.jpg"
  );

  // Fetch token
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const storedToken = await getToken();
        setToken(storedToken?.access || null);
      } catch (error) {
        console.error("Error fetching token:", error);
      }
    };
    fetchToken();
  }, []);

  // Fetch user data
  const { data, isLoading, isError, error } = useGetLoggedUserQuery(token, {
    skip: !token,
  });

  // Load profile image
  useEffect(() => {
    const loadProfileImage = async () => {
      try {
        const storedImage = await AsyncStorage.getItem("profileImage");
        if (storedImage) {
          setProfileImage(storedImage);
        }
      } catch (error) {
        console.error("Error loading profile image:", error);
      }
    };
    loadProfileImage();
  }, []);

  const pickImage = async () => {
    ImagePicker.launchImageLibrary(
      {
        mediaType: "photo",
        selectionLimit: 1,
      },
      async (response) => {
        if (response.didCancel) {
          Alert.alert("Image selection cancelled");
        } else if (response.assets && response.assets.length > 0) {
          const selectedImage = response.assets[0].uri;
          setProfileImage(selectedImage);
          try {
            await AsyncStorage.setItem("profileImage", selectedImage);
          } catch (error) {
            Alert.alert("Error", "Failed to save profile image");
          }
        } else if (response.errorCode) {
          Alert.alert("Error", response.errorMessage || "Failed to select image");
        }
      }
    );
  };

  const onLogoutPress = async () => {
    try {
      await handleLogout();  
    } catch (error) {
      Alert.alert("Error", "Failed to log out");
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.container}>
        <Text>Error loading profile. Please try again.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <TouchableOpacity onPress={pickImage} style={styles.imageWrapper}>
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
          <View style={styles.editIconContainer}>
            <MaterialIcons name="camera" size={scale(20)} color="white" />
          </View>
        </TouchableOpacity>

        <View style={styles.infoContainer}>
          <Text style={styles.name}>{data?.name || "Guest"}</Text>
          <Text style={styles.email}>{data?.email || "No email"}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={onLogoutPress}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("changePassword")}
        style={styles.buttonSecondary}
      >
        <Text style={styles.buttonText}>Change Password</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    paddingHorizontal: scale(20),
  },
  profileContainer: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: scale(20),
    borderRadius: scale(15),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.1,
    shadowRadius: scale(8),
    elevation: 6,
    width: "100%",
    marginBottom: verticalScale(20),
  },
  imageWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  profileImage: {
    width: scale(130),
    height: scale(130),
    borderRadius: scale(65),
    marginBottom: verticalScale(15),
    borderWidth: scale(3),
    borderColor: "#6C63FF",
  },
  editIconContainer: {
    position: "absolute",
    bottom: scale(8),
    right: scale(8),
    backgroundColor: "#6C63FF",
    borderRadius: scale(20),
    padding: scale(6),
  },
  infoContainer: {
    alignItems: "center",
  },
  name: {
    fontSize: moderateScale(22),
    fontWeight: "bold",
    color: "#333",
    marginBottom: verticalScale(5),
  },
  email: {
    fontSize: moderateScale(16),
    color: "#777",
  },
  button: {
    backgroundColor: "#6C63FF",
    paddingVertical: verticalScale(14),
    borderRadius: scale(10),
    width: "100%",
    alignItems: "center",
    marginBottom: verticalScale(12),
  },
  buttonSecondary: {
    backgroundColor: "#5553FF",
    paddingVertical: verticalScale(14),
    borderRadius: scale(10),
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: moderateScale(16),
    fontWeight: "bold",
  },
});

export default Account;