import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import {
  GoogleSignin,
  GoogleSigninButton,
} from '@react-native-google-signin/google-signin';
import {WEB_CLIENT_ID} from '@env';

interface LoginProps {
  onSwitchToSignup: () => void;
}

const Login: React.FC<LoginProps> = ({onSwitchToSignup}) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  useEffect(() => {
    async function init() {
      const has = await GoogleSignin.hasPlayServices();
      if (has) {
        GoogleSignin.configure({
          offlineAccess: true,
          webClientId: WEB_CLIENT_ID,
        });
      }
    }
    init();
  }, []);

  const onLogin = () => {
    auth()
      .signInWithEmailAndPassword(email, password)
      .then(async () => {
        console.log('User signed in!');
      })
      .catch(error => {
        console.log('error: ', error);
        if (error.code === 'auth/user-not-found') {
          console.log('No user found for that email.');
        }

        if (error.code === 'auth/wrong-password') {
          console.log('Incorrect password.');
        }

        console.error(error);
      });
  };

  const onGoogleButtonPress = async () => {
    try {
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
      // Obtain the user's ID token
      const data: any = await GoogleSignin.signIn();

      // create a new firebase credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(
        data?.data.idToken,
      );

      console.log('credential: ', googleCredential);
      // login with credential
      await auth().signInWithCredential(googleCredential);

      //  Handle the linked account as needed in your app
      return;
    } catch (e) {
      console.log('e: ', e);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={require('./assets/images/auth.png')}
          style={styles.logo}
        />
      </View>
      <View style={styles.formContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Sign In</Text>
          <View style={styles.border}></View>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrapper}>
            <Image
              source={require('./assets/images/icon-message.png')}
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter Your Email"
              value={email}
              placeholderTextColor="#616161"
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <Image
              source={require('./assets/images/icon-password.png')}
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter Your Password"
              value={password}
              placeholderTextColor="#616161"
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.btnlogin}
          onPress={onLogin}>
          <Text style={styles.buttonText}>Log In</Text>
        </TouchableOpacity>
        <View style={styles.orContainer1}>
          <View style={styles.orContainer}>
            <View style={styles.line} />
            <Text style={styles.orText}>Or login with</Text>
            <View style={styles.line} />
          </View>
        </View>
        <GoogleSigninButton
          onPress={() =>
            onGoogleButtonPress().then(() =>
              console.log('Signed in with Google!'),
            )
          }
        />
        <Text style={styles.signUpText}>
          Don’t have an Account?{' '}
          <Text style={styles.signUpLink} onPress={onSwitchToSignup}>
            Sign up
          </Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    height: '100%',
    width: '100%',
  },
  imageContainer: {
    height: '22%',
  },
  logo: {
    width: '100%',
  },
  button: {
    width: '80%',
    height: 50,
    backgroundColor: '#6200ea',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchButton: {
    marginTop: 15,
    marginBottom: 15,
  },
  switchButtonText: {
    color: '#6200ea',
    fontSize: 14,
  },
  heading: {
    fontSize: 30,
    margin: 10,
  },
  formContainer: {
    padding: 20,
    flex: 1,
  },
  headerContainer: {
    marginBottom: 40,
  },
  header: {
    fontSize: 40,
    color: 'black',
    fontWeight: 'bold',
    paddingBottom: 10,
  },
  border: {
    borderBottomWidth: 3,
    borderBottomColor: '#FB9EC6',
    width: '25%',
    alignSelf: 'flex-start',
  },
  inputContainer: {
    width: '100%',
    paddingBottom: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: 'black',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FB9EC6',
    marginBottom: 15,
    paddingHorizontal: 10,
    paddingTop: 3,
    paddingBottom: 3,
    borderRadius: 5,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingLeft: 10,
    color: 'black',
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
  icon: {
    marginRight: 10,
    width: 18,
    height: 18,
  },
  btnlogin: {
    paddingVertical: 12,
    backgroundColor: '#FB9EC6',
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  btnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signUpText: {
    fontSize: 16,
    marginTop: 10,
    color: '#616161',
    textAlign: 'center',
    width: '100%',
  },
  signUpLink: {
    color: '#FB9EC6',
    fontWeight: 'bold',
  },
  // Styles for the checkbox
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkboxWrapper: {
    marginRight: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#FB9EC6',
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checked: {
    backgroundColor: '#FB9EC6',
  },
  checkMark: {
    fontSize: 10,
    alignItems: 'center',
    textAlign: 'center',
    color: 'white',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#616161',
  },
  orContainer1: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    width: '70%',
    justifyContent: 'center',
  },
  line: {
    flex: 1, // Garis menyesuaikan lebar container
    height: 1,
    backgroundColor: '#ccc',
  },
  orText: {
    marginHorizontal: 20, // Jarak horizontal antara garis dan teks
    fontSize: 16,
    color: '#FB9EC6',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Login;
