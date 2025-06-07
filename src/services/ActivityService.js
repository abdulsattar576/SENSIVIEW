import AsyncStorage from '@react-native-async-storage/async-storage';

const ACTIVITY_KEY = '@activity_history';
const MAX_ACTIVITIES = 50;

export const saveActivity = async (activity) => {
  try {
    const existingActivities = await getActivities();
    const updatedActivities = [activity, ...existingActivities].slice(0, MAX_ACTIVITIES);
    await AsyncStorage.setItem(ACTIVITY_KEY, JSON.stringify(updatedActivities));
    return true;
  } catch (error) {
    console.error('Failed to save activity:', error);
    return false;
  }
};

export const getActivities = async () => {
  try {
    const activities = await AsyncStorage.getItem(ACTIVITY_KEY);
    return activities ? JSON.parse(activities) : [];
  } catch (error) {
    console.error('Failed to get activities:', error);
    return [];
  }
};

export const clearActivities = async () => {
  try {
    await AsyncStorage.removeItem(ACTIVITY_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear activities:', error);
    return false;
  }
};