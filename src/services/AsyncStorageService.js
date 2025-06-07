import AsyncStorage from '@react-native-async-storage/async-storage';

const storeToken = async (value) => {
    try {
        const new_value = JSON.stringify(value);
        await AsyncStorage.setItem('token', new_value);  // Store the stringified token
    } catch (error) {
        console.log('Error storing token:', error);
    }
};

const getToken = async () => {
    try {
        const token = await AsyncStorage.getItem('token');
        return token ? JSON.parse(token) : null;  // Properly parse JSON if token exists
    } catch (error) {
        console.log('Error retrieving token:', error);
        return null;
    }
};

const removeToken = async () => {
    try {
        await AsyncStorage.removeItem('token');
    } catch (error) {
        console.log('Error removing token:', error);
    }
};

export { storeToken, getToken, removeToken };
