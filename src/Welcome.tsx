// src/screens/WelcomeScreen.tsx
import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';

interface WelcomeProps {
  onNext: () => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onNext }) =>  {
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={require('./assets/images/welcome.png')}
          style={styles.logo}
        />
      </View>
      <View style={styles.titleContainer}>
        <Image
          source={require('./assets/images/text-appname.png')}
          style={styles.title}
        />
        <Text style={styles.subtitle}>
          Welcome! Discover a fun and exciting way to chat, share stories, and
          stay connected with your loved ones!
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            onNext(); // Memanggil fungsi onNext untuk menandakan bahwa halaman selanjutnya akan ditampilkan
          }}>
          <Text style={styles.text}>Continue</Text>
          <View style={styles.circle}>
            <Image source={require('./assets/images/arrow.png')} />
          </View>
        </TouchableOpacity>
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
    height: '70%',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  titleContainer: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FB9EC6',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 50,
    lineHeight: 22,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  text: {
    fontSize: 16,
    fontWeight: '400',
    marginRight: 10,
    color: '#333',
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF8EC7', // Pink seperti pada gambar
    alignItems: 'center',
    justifyContent: 'center',
  },
});
export default Welcome;
