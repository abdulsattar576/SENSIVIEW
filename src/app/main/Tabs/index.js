 import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Dimensions,
  StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
 
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
 
import ObjectDetect from '../../../component/items/ObjectDetect';
import { useDispatch } from 'react-redux';
import { addinfo } from '../../../redux/Slice';
 

const {width, height} = Dimensions.get('window');

const index = ({navigation}) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
const dispatch=useDispatch()
  const menuItems = [
    {icon: 'text-outline', name: 'Text', action: 'TextDetection'},
 
    {icon: 'image-outline', name: 'Images', action: 'ImageDetection'},
    {icon: 'search-outline', name: 'Find', action: 'find'},
    {icon: 'seat-outline', name: 'Seat', action: 'seatDetect'},
  ];

  const handleNavigation = (screen,name) => {
    toggleDrawer();
    dispatch(addinfo(name))
    navigation.navigate(screen);

  };

  const toggleDrawer = () => setDrawerVisible(!drawerVisible);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#6C63FF" barStyle="light-content" />
      
      {/* App Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={toggleDrawer} 
          style={styles.headerButton}
          activeOpacity={0.8}
        >
          <Ionicons name="menu-outline" size={26} color="white" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>SENSIVIEW</Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('profile')}
            style={styles.headerButton}
            activeOpacity={0.8}
          >
            <Ionicons name="person-outline" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Info')}
            style={styles.headerButton}
            activeOpacity={0.8}
          >
            <Ionicons name="information-circle-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Area */}
      <View style={styles.content}>
        <View style={styles.detectionBox}>
         
          <ObjectDetect/>
        </View>
      </View>

      {/* Navigation Drawer */}
      <Modal
        visible={drawerVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={toggleDrawer}
      >
        <TouchableOpacity 
          style={styles.drawerBackdrop}
          activeOpacity={1}
          onPress={toggleDrawer}
        >
          <View style={styles.drawerContainer}>
            <View style={styles.drawer}>
              <View style={styles.drawerHeader}>
                <Text style={styles.drawerTitle}>SENSIVIEW</Text>
                <TouchableOpacity 
                  onPress={toggleDrawer}
                  style={styles.closeButton}
                  activeOpacity={0.8}
                >
                  <Ionicons name="menu-outline" size={26} color="#6C63FF" />
                </TouchableOpacity>
              </View>
              
              <ScrollView 
                style={styles.menuList}
                showsVerticalScrollIndicator={false}
              >
                {menuItems.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.menuItem}
                    onPress={() => handleNavigation(item.action,item.name)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.menuIconContainer}>
                      <Ionicons 
                        name={item.icon} 
                        size={22} 
                        color="#6C63FF" 
                      />
                    </View>
                    <Text style={styles.menuText}>{item.name} Detection</Text>
                    <Ionicons 
                      name="chevron-forward" 
                      size={18} 
                      color="#999" 
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: moderateScale(20),
    paddingTop: StatusBar.currentHeight + verticalScale(10),
    paddingBottom: verticalScale(15),
    backgroundColor: '#6C63FF',
    borderBottomLeftRadius: moderateScale(20),
    borderBottomRightRadius: moderateScale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: moderateScale(20),
    fontWeight: '600',
    color: 'white',
    letterSpacing: 0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(15),
  },
  headerButton: {
    padding: moderateScale(6),
  },
  content: {
    flex: 1,
    paddingHorizontal: moderateScale(5),
     paddingVertical:verticalScale(5)
  },
  detectionBox: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: moderateScale(16),
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
  drawerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  drawerContainer: {
    flex: 1,
    width: '80%',
  },
  drawer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopRightRadius: moderateScale(20),
    borderBottomRightRadius: moderateScale(20),
    paddingHorizontal: moderateScale(20),
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(20),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  drawerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: moderateScale(5),
  },
  menuList: {
    paddingTop: verticalScale(10),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  menuIconContainer: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(15),
  },
  menuText: {
    flex: 1,
    fontSize: moderateScale(16),
    color: '#444',
    fontWeight: '500',
  },
});

export default index;