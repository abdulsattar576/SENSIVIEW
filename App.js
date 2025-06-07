import React, { createContext, useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Provider } from "react-redux";
import { store } from "./src/redux/store";
import { jwtDecode } from "jwt-decode";
import AuthScreen from "./src/app/auth/AuthScreen";
import MainScreen from "./src/app/main/MainScreen";
import { getToken, removeToken } from "./src/services/AsyncStorageService";

 
export const AuthContext = createContext();

const Stack = createNativeStackNavigator();

const AppContent = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

 
  const handleLogout = async () => {
    try {
      await removeToken();
      setIsLoggedIn(false);  
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

   
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const tokenData = await getToken();

        if (!tokenData?.access) {
          console.log("No access token found.");
          setIsLoading(false);
          return;
        }

        const decodedAccess = jwtDecode(tokenData.access);
        const currentTime = Math.floor(Date.now() / 1000);

        if (decodedAccess.exp && decodedAccess.exp > currentTime) {
          console.log("Valid token. Logging in...");
          setIsLoggedIn(true);
        } else {
          console.log("Token expired. Removing token.");
          await removeToken();
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ handleLogout }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isLoggedIn ? (
            <Stack.Screen name="main" component={MainScreen} />
          ) : (
            <Stack.Screen name="auth">
              {(props) => <AuthScreen {...props} onLoginSuccess={() => setIsLoggedIn(true)} />}
            </Stack.Screen>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;