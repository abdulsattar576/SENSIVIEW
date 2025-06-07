import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {
  moderateScale,
  scale,
  verticalScale,
} from 'react-native-size-matters';

import { useChangeUserPasswordMutation } from '../../services/UserAuthApi';
import { getToken } from '../../services/AsyncStorageService';

const ChangePassword = () => {
  const navigation = useNavigation();

  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [securePassword, setSecurePassword] = useState(true);
  const [securePassword2, setSecurePassword2] = useState(true);
  const [errors, setErrors] = useState({
    password: '',
    password2: '',
  });
  const [loading, setLoading] = useState(false);

  const [ChangeUserPassword, { isSuccess, error }] = useChangeUserPasswordMutation();

  const sendData = async () => {
    setErrors({ password: '', password2: '' });

    if (password !== password2) {
      setErrors({ password: '', password2: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    const token = await getToken();

    if (token && token.access) {
      const result = await ChangeUserPassword({
        formData: { password, password2 },
        access: token.access,
      });

      setLoading(false);
      console.log(result);

      if ('error' in result && result.error && result.error.data) {
        if (result.error.data.errors) {
          setErrors({
            password: result.error.data.errors.password
              ? result.error.data.errors.password[0]
              : '',
            password2: result.error.data.errors.password2
              ? result.error.data.errors.password2[0]
              : '',
          });
        }
      }
    } else {
      setLoading(false);
      setErrors({ password: 'Authentication token missing', password2: '' });
    }
  };

  useEffect(() => {
    if (isSuccess) {
      navigation.navigate('TabScreen');
    }
  }, [isSuccess]);

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Change Password</Text>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="New Password"
          placeholderTextColor="#aaa"
          style={styles.input}
          secureTextEntry={securePassword}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setSecurePassword(!securePassword)}>
          <AntDesign
            name={securePassword ? 'eyeo' : 'eye'}
            size={20}
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>
      {errors.password !== '' && (
        <Text style={styles.errorText}>{errors.password}</Text>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Confirm Password"
          placeholderTextColor="#aaa"
          style={styles.input}
          secureTextEntry={securePassword2}
          onChangeText={setPassword2}
        />
        <TouchableOpacity onPress={() => setSecurePassword2(!securePassword2)}>
          <AntDesign
            name={securePassword2 ? 'eyeo' : 'eye'}
            size={20}
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>
      {errors.password2 !== '' && (
        <Text style={styles.errorText}>{errors.password2}</Text>
      )}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={sendData}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Processing...' : 'SEND'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    backgroundColor: '#F4F4F4',
  },
  headerText: {
    fontSize: moderateScale(22),
    fontWeight: 'bold',
    marginBottom: verticalScale(20),
    color: '#4630eb',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: scale(270),
    borderWidth: 1,
    borderRadius: moderateScale(12),
    borderColor: '#4630eb',
    backgroundColor: '#FFF',
    paddingHorizontal: scale(15),
    marginBottom: verticalScale(15),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    flex: 1,
    height: verticalScale(45),
    fontSize: moderateScale(16),
    color: '#333',
  },
  icon: {
    marginLeft: scale(10),
    color: '#4630eb',
  },
  button: {
    backgroundColor: '#4630eb',
    paddingVertical: verticalScale(12),
    width: scale(220),
    borderRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonDisabled: {
    backgroundColor: '#bbb',
  },
  buttonText: {
    fontSize: moderateScale(18),
    color: 'white',
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: moderateScale(13),
    marginBottom: verticalScale(10),
    alignSelf: 'flex-start',
    marginLeft: scale(25),
  },
});

export default ChangePassword;