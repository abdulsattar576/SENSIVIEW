import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Platform,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { clearActivities, getActivities } from '../../../services/ActivityService';
import Tts from 'react-native-tts';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
 
Tts.setDefaultLanguage('en-US');

const RecentActivityScreen = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Load activities when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadActivities();
      return () => {
        Tts.stop(); // Stop any ongoing speech when leaving screen
      };
    }, [])
  );

  const loadActivities = async () => {
    try {
      const storedActivities = await getActivities();
      setActivities(storedActivities);
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadActivities();
  };

  const speakDetectionResults = (activity) => {
    Tts.stop();
    
    if (activity.type === 'object_detection') {
      if (activity.results.length === 0) {
        Tts.speak("No objects detected in this image");
      } else {
        const summary = activity.results.reduce((acc, cur) => {
          const label = cur.class_name.toLowerCase();
          acc[label] = (acc[label] || 0) + 1;
          return acc;
        }, {});
        
        const message = Object.entries(summary)
          .map(([label, count]) => `${count} ${label}${count > 1 ? 's' : ''}`)
          .join(', ');
        
        Tts.speak(`Detected ${message}`);
      }
    } else if (activity.type === 'text_detection') {
      if (activity.results.length === 0) {
        Tts.speak("No text detected in this image");
      } else {
        Tts.speak(`Detected text: ${activity.results.join(', ')}`);
      }
    }
  };

  const renderActivityItem = ({ item, index }) => (
    <TouchableOpacity
      style={[
        styles.activityItem,
        selectedItem === index && styles.selectedItem
      ]}
      onPress={() => {
        setSelectedItem(index === selectedItem ? null : index);
        speakDetectionResults(item);
      }}
      activeOpacity={0.7}
    >
      <View style={styles.itemHeader}>
        <View style={styles.iconContainer}>
          <Icon
            name={item.type === 'object_detection' ? 'cube-outline' : 'text-outline'}
            size={scale(20)}
            color="#5E6DFF"
          />
        </View>
        <View style={styles.itemTextContainer}>
          <Text style={styles.itemTitle}>
            {item.type === 'object_detection' ? 'Objects Detected' : 'Text Detected'}
          </Text>
          <Text style={styles.itemTimestamp}>
            {formatTimestamp(item.timestamp)}
          </Text>
        </View>
        <View style={styles.resultBadge}>
          <Text style={styles.resultCount}>
            {item.results.length}
          </Text>
        </View>
      </View>

      {selectedItem === index && (
        <View style={styles.detailsContainer}>
          {item.imageUri && (
            <Image
              source={{ uri: item.imageUri }}
              style={styles.detailImage}
              resizeMode="contain"
            />
          )}
          
          <View style={styles.resultsContainer}>
            {item.results.length > 0 ? (
              <>
                <Text style={styles.detailTitle}>
                  {item.type === 'object_detection' ? 'Detected Objects' : 'Detected Text'}
                </Text>
                {item.type === 'object_detection' ? (
                  <FlatList
                    data={groupDetections(item.results)}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item, idx) => idx.toString()}
                    renderItem={({ item: detection }) => (
                      <View style={styles.detectionPill}>
                        <Text style={styles.detectionCount}>{detection.count}</Text>
                        <Text style={styles.detectionLabel}>
                          {detection.label.toLowerCase()}
                        </Text>
                      </View>
                    )}
                    contentContainerStyle={styles.detectionList}
                  />
                ) : (
                  <ScrollView style={styles.textResultsContainer}>
                    {item.results.map((text, idx) => (
                      <Text key={idx} style={styles.textResult}>
                        {text}
                      </Text>
                    ))}
                  </ScrollView>
                )}
              </>
            ) : (
              <Text style={styles.noResultsText}>
                No {item.type === 'object_detection' ? 'objects' : 'text'} detected
              </Text>
            )}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  const groupDetections = (detections) => {
    const grouped = detections.reduce((acc, cur) => {
      const label = cur.class_name;
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(grouped).map(([label, count]) => ({
      label,
      count
    }));
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5E6DFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Detection History</Text>
        <Text style={styles.subtitle}>
          {activities.length} {activities.length === 1 ? 'item' : 'items'}
        </Text>
           
      </View>

      {activities.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="time-outline" size={scale(60)} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No detection history</Text>
          <Text style={styles.emptySubtitle}>
            Your recent detections will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={activities}
          renderItem={renderActivityItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#5E6DFF']}
              tintColor="#5E6DFF"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: moderateScale(16),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingVertical: verticalScale(16),
    paddingHorizontal: moderateScale(4),
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: moderateScale(14),
    color: '#6B7280',
    marginTop: verticalScale(4),
  },
  listContainer: {
    paddingBottom: verticalScale(24),
  },
  activityItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(12),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  selectedItem: {
    borderWidth: 1,
    borderColor: '#5E6DFF',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(16),
  },
  iconContainer: {
    backgroundColor: '#E0E7FF',
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(12),
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#111827',
  },
  itemTimestamp: {
    fontSize: moderateScale(13),
    color: '#6B7280',
    marginTop: verticalScale(2),
  },
  resultBadge: {
    backgroundColor: '#E0E7FF',
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(14),
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultCount: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#5E6DFF',
  },
  detailsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    padding: moderateScale(16),
  },
  detailImage: {
    width: '100%',
    height: verticalScale(isSmallDevice ? 150 : 180),
    borderRadius: moderateScale(8),
    backgroundColor: '#F3F4F6',
    marginBottom: verticalScale(16),
  },
  resultsContainer: {
    minHeight: verticalScale(60),
  },
  detailTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#111827',
    marginBottom: verticalScale(12),
  },
  detectionList: {
    paddingBottom: moderateScale(4),
  },
  detectionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0E7FF',
    paddingHorizontal: moderateScale(12),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(20),
    marginRight: moderateScale(8),
  },
  detectionCount: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: '#5E6DFF',
    marginRight: moderateScale(4),
  },
  detectionLabel: {
    fontSize: moderateScale(14),
    color: '#5E6DFF',
  },
  textResultsContainer: {
    maxHeight: verticalScale(120),
  },
  textResult: {
    fontSize: moderateScale(15),
    color: '#374151',
    marginBottom: verticalScale(8),
    lineHeight: verticalScale(22),
  },
  noResultsText: {
    fontSize: moderateScale(14),
    color: '#6B7280',
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: moderateScale(40),
  },
  emptyTitle: {
    fontSize: moderateScale(18),
    color: '#374151',
    marginTop: verticalScale(16),
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: moderateScale(14),
    color: '#9CA3AF',
    marginTop: verticalScale(4),
    textAlign: 'center',
  },
});

export default RecentActivityScreen;