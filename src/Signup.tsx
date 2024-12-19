import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import {db} from './config/firebase'; // Ensure you have your Firebase config set up
import {collection, addDoc} from 'firebase/firestore';
import {
  GoogleSignin,
  GoogleSigninButton,
} from '@react-native-google-signin/google-signin';
interface SignupProps {
  onSwitchToLogin: () => void;
}

const Signup: React.FC<SignupProps> = ({onSwitchToLogin}) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

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
  const onSignup = () => {
    auth()
      .createUserWithEmailAndPassword(email, password)
      .then(({user}) => {
        console.log('User account created & signed in!');
        if (!user) return;

        addDoc(collection(db, 'users'), {
          _id: user.uid,
          name: user.email,
          avatar: user.photoURL,
        });
      })
      .catch(error => {
        console.log('error: ', error);
        if (error.code === 'auth/email-already-in-use') {
          console.log('That email address is already in use!');
        }

        if (error.code === 'auth/invalid-email') {
          console.log('That email address is invalid!');
        }

        console.error(error);
      });
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
          <Text style={styles.header}>Sign Up</Text>
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
              placeholder="Email"
              value={email}
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
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        </View>
        <TouchableOpacity style={styles.btnlogin} onPress={onSignup}>
          <Text style={styles.buttonText}>Create Account</Text>
        </TouchableOpacity>
        <Text style={styles.signUpText}>
          Already have an Account!{' '}
          <Text style={styles.signUpLink} onPress={onSwitchToLogin}>
            Sign In
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
    height: '40%',
  },
  logo: {
    width: '100%',
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
    color: '#616161',
    textAlign: 'center',
    width: '100%',
    marginTop: 10,
  },
  signUpLink: {
    color: '#FB9EC6',
    fontWeight: 'bold',
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
  },
  switchButtonText: {
    color: '#6200ea',
    fontSize: 14,
  },
  heading: {
    fontSize: 30,
    margin: 10,
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

export default Signup;
