import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { useLoginUserMutation } from '../../services/UserAuthApi';
import { storeToken } from '../../services/AsyncStorageService';
import { useNavigation } from '@react-navigation/native';

const LoginScreen = ({ onLoginSuccess }) => {
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    nonField: '',
  });

  const [loginUser] = useLoginUserMutation();

  const handleSubmit = async () => {
    setErrors({ email: '', password: '', nonField: '' });

    if (!email) {
      setErrors((prev) => ({ ...prev, email: 'Email is required' }));
      return;
    }

    if (!password) {
      setErrors((prev) => ({ ...prev, password: 'Password is required' }));
      return;
    }

    const formData = { email, password };

    try {
      const result = await loginUser(formData);
      console.log('Login result:', result);

      if (result.data) {
        await storeToken(result.data.token);
        onLoginSuccess(); // Call onLoginSuccess to update isLoggedIn state
      }

      if (result.error) {
        if (result.error.status === 404) {
          setErrors((prev) => ({
            ...prev,
            nonField: 'User not found or invalid credentials',
          }));
          return;
        }

        if (result.error.data?.errors) {
          setErrors({
            email: result.error.data.errors.email?.[0] || '',
            password: result.error.data.errors.password?.[0] || '',
            nonField: result.error.data.errors.non_field_errors?.[0] || '',
          });
        } else {
          setErrors((prev) => ({
            ...prev,
            nonField: 'Login failed. Please try again.',
          }));
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors((prev) => ({ ...prev, nonField: 'An unexpected error occurred' }));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Welcome Back to Sensiview!</Text>

      <View style={styles.inputContainer}>
        <AntDesign name="mail" size={moderateScale(20)} color="#6C63FF" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          placeholderTextColor="#aaa"
          autoCapitalize="none"
          onChangeText={setEmail}
          value={email}
        />
      </View>
      {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

      <View style={styles.inputContainer}>
        <AntDesign name="lock" size={moderateScale(20)} color="#6C63FF" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#aaa"
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          onChangeText={setPassword}
          value={password}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <AntDesign
            name={showPassword ? 'eye' : 'eyeo'}
            size={moderateScale(20)}
            color="#6C63FF"
          />
        </TouchableOpacity>
      </View>
      {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

      {errors.nonField ? <Text style={styles.errorText}>{errors.nonField}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('signup')}>
        <Text style={styles.link}>
          Don't have an account? <Text style={styles.signupText}>Sign Up</Text>
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
    padding: moderateScale(20),
    backgroundColor: '#EEF2F7',
  },
  headerText: {
    fontSize: moderateScale(26),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: verticalScale(30),
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(15),
    paddingHorizontal: moderateScale(15),
    marginBottom: verticalScale(8),
    width: scale(300),
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(10),
    elevation: 4,
  },
  icon: {
    marginRight: moderateScale(10),
  },
  input: {
    flex: 1,
    height: verticalScale(40),
    fontSize: moderateScale(16),
    color: '#333',
  },
  button: {
    backgroundColor: '#6C63FF',
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(50),
    borderRadius: moderateScale(12),
    width: scale(300),
    alignItems: 'center',
    shadowColor: '#6C63FF',
    shadowOpacity: 0.3,
    shadowRadius: moderateScale(10),
    elevation: 5,
    marginTop: verticalScale(10),
  },
  buttonText: {
    color: '#fff',
    fontSize: moderateScale(18),
    fontWeight: 'bold',
  },
  link: {
    marginTop: verticalScale(20),
    color: '#333',
    fontSize: moderateScale(14),
  },
  signupText: {
    color: '#6C63FF',
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: moderateScale(12),
    marginBottom: verticalScale(10),
    width: scale(300),
    paddingLeft: moderateScale(10),
  },
});

export default LoginScreen;