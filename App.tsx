import React, {useEffect, useState} from 'react';
import {StyleSheet, SafeAreaView} from 'react-native';
import BootSplash from 'react-native-bootsplash';
import usePushNotification from './src/usePushNotification';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import Signup from './src/Signup';
import Login from './src/Login';
import Welcome from './src/Welcome'; 
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {WEB_CLIENT_ID} from '@env';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Friends} from './src/Friends';
import {db} from './src/config/firebase';
import {
  collection,
  doc,
  query,
  where,
  getDocs,
  updateDoc,
} from 'firebase/firestore';

const App: React.FC = () => {
  const [isSignup, setIsSignup] = useState<boolean>(false);
  const [isFirstTime, setIsFirstTime] = useState<boolean>(true); 

  const {
    requestUserPermission,
    getFCMToken,
    listenToBackgroundNotifications,
    listenToForegroundNotifications,
    onNotificationOpenedAppFromBackground,
    onNotificationOpenedAppFromQuit,
  } = usePushNotification();

  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  useEffect(() => {
    async function init() {
      const has = await GoogleSignin.hasPlayServices();
      if (has) {
        GoogleSignin.configure({
          webClientId: WEB_CLIENT_ID,
        });
      }
    }
    init();
  }, []);

  function onAuthStateChanged(user: FirebaseAuthTypes.User | null) {
    if (user) {
      const messagesRef = collection(db, 'users');
      const q = query(
        messagesRef,
        where('name', '==', user?.email),
      );
      getDocs(q)
        .then(snapshot => {
          if (snapshot.empty) {
            console.log('No users found.');
          } else {
            const usersList: any = snapshot.docs.map(doc => ({
              ID: doc.id,
              ...doc.data(),
            }));
            const userdetails = {...(user as any)._user, ...usersList[0]};
            console.log('userdetails: ', userdetails);
            setUser(userdetails);
            setFcmToken(userdetails?.ID);
          }
        })
        .catch(error => {
          console.error('Error fetching users:', error);
        });
    } else {
      setUser(null);
    }
    if (initializing) setInitializing(false);
  }

  async function setFcmToken(usersId: string) {
    const fcmToken = await getFCMToken();
    updateDoc(doc(db, 'users', usersId), {
      fcmToken,
    });
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  useEffect(() => {
    setTimeout(async () => {
      await BootSplash.hide({fade: true});
      console.log('BootSplash has been hidden successfully');
    }, 400);
  }, []);

  useEffect(() => {
    const listenToNotifications = () => {
      try {
        getFCMToken();
        requestUserPermission();
        onNotificationOpenedAppFromQuit();
        listenToBackgroundNotifications();
        listenToForegroundNotifications();
        onNotificationOpenedAppFromBackground();
      } catch (error) {
        console.log(error);
      }
    };

    listenToNotifications();
  }, [
    getFCMToken,
    listenToBackgroundNotifications,
    listenToForegroundNotifications,
    onNotificationOpenedAppFromBackground,
    onNotificationOpenedAppFromQuit,
    requestUserPermission,
  ]);

  const onLogout = () => {
    auth()
      .signOut()
      .then(() => console.log('User signed out!'))
      .catch(error => console.error('Error signing out:', error));
  };

  const handleNext = () => {
    setIsFirstTime(false); 
  };

  if (initializing) return <></>;

  if (isFirstTime) {
    return (
      <SafeAreaView style={styles.container}>
        <Welcome onNext={handleNext} />
      </SafeAreaView>
    );
  }

  if (!!user) {
    return (
      <SafeAreaProvider>
        <Friends user={user} onLogout={onLogout} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {isSignup ? (
        <Signup onSwitchToLogin={() => setIsSignup(false)} />
      ) : (
        <Login onSwitchToSignup={() => setIsSignup(true)} />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between', 
    alignItems: 'center',
    padding: 5,
  },
  headerText: {
    color: '#00001a',
    fontSize: 18,
  },
  logoutButton: {
    backgroundColor: '#66b3ff', 
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 5,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  input: {
    width: '80%',
    height: 50,
    borderWidth: 1,
    borderColor: '#555', 
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
    color: '#fff', 
    backgroundColor: '#1e1e1e', 
  },
  button: {
    height: 40,
    width: 120,
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
  userContainer: {
    padding: 10,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e6e6ff', 
  },
  userText: {
    color: '#fff',
    fontSize: 18,
  },

  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 50,
  },
  avatarText: {
    color: '#ffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default App;
