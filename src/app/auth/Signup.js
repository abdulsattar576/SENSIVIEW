import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { useRegisterUserMutation } from '../../services/UserAuthApi';
import { storeToken } from '../../services/AsyncStorageService';
import { useNavigation } from '@react-navigation/native';

const SignupScreen = ({ onLoginSuccess }) => {
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [tc, setTc] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    password2: '',
    tc: '',
    nonField: '',
  });

  const [registerUser] = useRegisterUserMutation();

  const handleSubmit = async () => {
    setErrors({ name: '', email: '', password: '', password2: '', tc: '', nonField: '' });

    if (!name) {
      setErrors((prev) => ({ ...prev, name: 'Full name is required' }));
      return;
    }
    if (!email) {
      setErrors((prev) => ({ ...prev, email: 'Email is required' }));
      return;
    }
    if (!password) {
      setErrors((prev) => ({ ...prev, password: 'Password is required' }));
      return;
    }
    if (!password2) {
      setErrors((prev) => ({ ...prev, password2: 'Confirm password is required' }));
      return;
    }
    if (password !== password2) {
      setErrors((prev) => ({ ...prev, password2: 'Passwords do not match' }));
      return;
    }
    if (!tc) {
      setErrors((prev) => ({ ...prev, tc: 'You must accept terms and conditions' }));
      return;
    }

    const formData = { name, email, password, password2, tc };

    try {
      const result = await registerUser(formData);
      

      if (result.data) {
        await storeToken(result.data.token); // Use result.data.token based on your API
        onLoginSuccess(); // Call onLoginSuccess to update isLoggedIn state
      }

      if (result.error) {
        if (result.error.status === 400 && result.error.data?.errors) {
          setErrors({
            name: result.error.data.errors.name?.[0] || '',
            email: result.error.data.errors.email?.[0] || '',
            password: result.error.data.errors.password?.[0] || '',
            password2: result.error.data.errors.password2?.[0] || '',
            tc: result.error.data.errors.tc?.[0] || '',
            nonField: result.error.data.errors.non_field_errors?.[0] || '',
          });
        } else {
          setErrors((prev) => ({
            ...prev,
            nonField: result.error.data?.message || 'Registration failed. Please try again.',
          }));
        }
      }
    } catch (error) {
      console.error('Signup error:', error);
      setErrors((prev) => ({ ...prev, nonField: 'An unexpected error occurred' }));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Create Account</Text>

      <View style={styles.inputContainer}>
        <AntDesign name="user" size={moderateScale(20)} color="#6C63FF" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor="#aaa"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
      </View>
      {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}

      <View style={styles.inputContainer}>
        <AntDesign name="mail" size={moderateScale(20)} color="#6C63FF" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          placeholderTextColor="#aaa"
          value={email}
          autoCapitalize="none"
          onChangeText={setEmail}
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
          value={password}
          autoCapitalize="none"
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <AntDesign name={showPassword ? 'eye' : 'eyeo'} size={moderateScale(20)} color="#6C63FF" />
        </TouchableOpacity>
      </View>
      {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

      <View style={styles.inputContainer}>
        <AntDesign name="lock" size={moderateScale(20)} color="#6C63FF" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#aaa"
          secureTextEntry={!showPassword}
          value={password2}
          autoCapitalize="none"
          onChangeText={setPassword2}
        />
      </View>
      {errors.password2 ? <Text style={styles.errorText}>{errors.password2}</Text> : null}

      <TouchableOpacity
        onPress={() => setTc(!tc)}
        style={styles.checkboxContainer}
        activeOpacity={0.7}
      >
        <View style={[styles.checkbox, tc && styles.checkboxChecked]}>
          {tc && <AntDesign name="check" size={moderateScale(14)} color="#fff" />}
        </View>
        <Text style={styles.checkboxLabel}>
          I agree to the Terms and Conditions
        </Text>
      </TouchableOpacity>
      {errors.tc ? <Text style={styles.errorText}>{errors.tc}</Text> : null}

      {errors.nonField ? <Text style={styles.errorText}>{errors.nonField}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('login')}>
        <Text style={styles.link}>
          Already have an account? <Text style={styles.loginText}>Login</Text>
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
  errorText: {
    color: 'red',
    fontSize: moderateScale(12),
    marginBottom: verticalScale(8),
    width: scale(300),
    paddingLeft: moderateScale(10),
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
  loginText: {
    color: '#6C63FF',
    fontWeight: 'bold',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: verticalScale(10),
    width: scale(300),
  },
  checkbox: {
    width: scale(20),
    height: scale(20),
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(10),
  },
  checkboxChecked: {
    backgroundColor: '#6C63FF',
  },
  checkboxLabel: {
    fontSize: moderateScale(14),
    color: '#333',
    flex: 1,
  },
});

export default SignupScreen;