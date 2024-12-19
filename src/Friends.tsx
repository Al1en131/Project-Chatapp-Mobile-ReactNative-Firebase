import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import {collection, getDocs, onSnapshot} from 'firebase/firestore';
import {db} from './config/firebase'; // Ensure Firebase is properly configured
import {Chat} from './Chat';

export function Friends({user, onLogout}: any) {
  const [users, setUsers] = useState<any>([]);
  const [friend, setFriend] = useState<any>(null);
  const [curentUser, setCurentUser] = useState(null);
  const [conversations, setConversation] = useState([]);

  useEffect(() => {
    const fetchConversations = () => {
      try {
        const conversationRef = collection(db, 'conversations');

        // Subscribe to real-time updates
        const unsubscribe = onSnapshot(conversationRef, snapshot => {
          const updatedConversations: any = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));

          console.log('Real-time conversations: ', updatedConversations);
          setConversation(updatedConversations);
        });

        // Cleanup the subscription when the component unmounts
        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    fetchConversations();
  }, [friend]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, 'users');
        const snapshot = await getDocs(usersCollection);
        const usersList: any = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCurentUser(usersList.find((x: any) => x.name === user.email));
        setUsers(usersList.filter((x: any) => x.name !== user?.email));
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, [user.email]);

  const getInitials = (email: string) => {
    if (!email) {
      return 'NA';
    } // Default initials
    const parts = email.split('@')[0].split('.');
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };


  const renderUser = ({item}: any) => {
    // Check if the user has an avatar URL
    const avatarUrl = item.avatar || null; // Replace 'avatar' with the actual field name in your Firestore data
    const c: any = conversations.find((c: any) =>
      c?.participants?.every((x: any) =>
        [(curentUser as any)?.id, item.id].includes(x),
      ),
    );
    const istyping = c?.isTyping[item?.id];
    const unseen =
      c?.senderId !== (curentUser as any).id &&
      c?.unseen?.[(curentUser as any)?.id];

    return (
      <TouchableOpacity
        style={[
          styles.userCard,
          {backgroundColor: unseen ? '#D45588' : 'transparent'},
        ]}
        onPress={() => setFriend(item)}>
        <View
          style={[
            styles.avatarContainer,
            {
              borderColor: unseen ? 'white' : '#D45588',
              backgroundColor: unseen ? 'white' : '#D45588',
            },
          ]}>
          {avatarUrl ? (
            // Display the avatar image if available
            <Image source={{uri: avatarUrl}} style={styles.avatarImage} />
          ) : (
            // Display initials if no avatar is available
            <Text
              style={[
                styles.avatarText,
                {color: unseen ? '#D45588' : 'white'},
              ]}>
              {getInitials(item.name)}
            </Text>
          )}
        </View>
        <View style={styles.userInfo}>
          <Text style={[styles.name, {color: unseen ? 'white' : '#D45588'}]}>
            {item.name || 'Anonymous'}
          </Text>
          <Text style={[styles.email, {color: unseen ? 'white' : '#D45588'}]}>
            {istyping ? 'Typing...' : c?.lastMessage}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (friend && users?.length) {
    return (
      <>
        <View style={{display: 'flex', backgroundColor: '#FFEBF2'}}>
          {/* Back Button */}
          <View>
            <TouchableOpacity onPress={() => setFriend(null)}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
          </View>

          {/* Avatar Section */}
          <View
            style={{
              height: 70,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <View
              style={[
                styles.chatHeader,
                {
                  backgroundColor: '#D45588',
                  width: 70,
                  height: 70,
                  borderRadius: 35,
                  borderWidth: 1,
                  borderColor: '#D45588',
                  justifyContent: 'center',
                  alignItems: 'center',
                },
              ]}>
              {friend?.avatar ? (
                <Image
                  source={{uri: friend?.avatar}}
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: 35,
                  }}
                />
              ) : (
                <Text style={styles.avatarText}>
                  {getInitials(friend?.name)}
                </Text>
              )}
            </View>
          </View>
        </View>

        <Chat friend={friend} user={curentUser} />
      </>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('./assets/images/home.png')}
          style={styles.logo}
        />
        <View style={styles.headerContainer}>
          <View style={styles.flexContainer}>
            <View style={[styles.avatarContainer, {borderColor: '#D45588'}]}>
              {(user as any)?.avatar ? (
                <>
                  <Image
                    source={{uri: (user as any)?.avatar}}
                    style={styles.avatarImageHeader}
                  />
                </>
              ) : (
                <Text style={[styles.avatarText]}>
                  {getInitials((user as any).email)}
                </Text>
              )}
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.flexContainer}>
            <View style={styles.textContainer}>
              <Text style={styles.headerUser}>
                Hey,{' '}
                {curentUser?.name
                  ? curentUser.name.length > 5
                    ? `${curentUser.name.substring(0, 5)}...`
                    : curentUser.name
                  : 'Guest'}
              </Text>

              <Text style={styles.headerDescription}>Let’s chat and catch</Text>
              <Text style={styles.headerDescription}>up with friends.</Text>
            </View>
            <View style={styles.logoContainer}>
              <Image
                style={styles.logo2}
                source={require('./assets/images/logo2.png')}
              />
            </View>
          </View>
        </View>
      </View>
      <View style={styles.tabchat}>
        <View style={styles.tabs}>
          <Text style={[styles.tab, styles.activeTab]}>Chats</Text>
          <Text style={styles.tab}>Friends</Text>
          <Text style={styles.tab}>Calls</Text>
        </View>

        {/* Friends List */}
        <FlatList
          data={users}
          keyExtractor={(item: any) => item.id}
          renderItem={renderUser}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    backgroundColor: '#FB9EC6',
  },
  header: {
    flexDirection: 'column',
    alignItems: 'center',
    height: '30%',
    position: 'relative',
  },
  logo: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    zIndex: 1,
  },
  headerContainer: {
    position: 'relative',
    zIndex: 2,
    padding: 20,
    flex: 1,
  },
  flexContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerUser: {
    color: '#D45588',
    fontSize: 30,
    marginBottom: 4,
    fontWeight: '700',
  },
  headerDescription: {
    color: '#D45588',
    fontSize: 18,
    fontWeight: '400',
  },
  logo2: {
    width: 150,
    height: 150,
    borderRadius: 35,
    resizeMode: 'contain',
  },
  textContainer: {
    width: '50%',
  },
  logoContainer: {
    width: '50%',
    alignItems: 'flex-end',
  },
  avatarContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    backgroundColor: '#D45588',
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  searchContainer: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#D45588',
    borderRadius: 20,
    width: '100%',
    backgroundColor: '#fff',
  },
  icon: {
    marginRight: 5,
  },
  searchInput: {
    flex: 1,
    padding: 10,
    fontSize: 16,
    color: '#D45588',
  },
  tabchat: {
    backgroundColor: '#FFEBF2',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: '70%',
    padding: 10,
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  tab: {
    fontSize: 16,
    color: '#E874A1',
  },
  activeTab: {
    color: '#D45588',
    fontWeight: 'bold',
    borderBottomWidth: 2,
    borderBottomColor: '#D45588',
    paddingBottom: 5,
  },
  itemContainer: {
    marginBottom: 10,
    marginTop: 10,
    marginRight: 20,
    marginLeft: 20,
    flexDirection: 'row',
    padding: 15,
    borderWidth: 1,
    borderColor: '#D45588',
    borderRadius: 20,
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 14,
    color: '#E66D96',
  },
  infoContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  time: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  badge: {
    backgroundColor: '#D45588',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 30,
    paddingTop: 30,
    borderWidth: 1,
    backgroundColor: '#FFEBF2',
    borderColor: '#D45588',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  logoutButton: {
    backgroundColor: '#D45588',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 5,
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  headerFriend: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    color: '#000000',
  },
  backButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#87CEEB',
  },
  backButtonText: {
    color: '#D45588',
    fontSize: 40,
    fontWeight: 'bold',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatHeader: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    color: '#000',
    fontSize: 30,
    fontWeight: 'bold',
  },
  list: {
    padding: 10,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#D45588',
    borderRadius: 15,
    marginBottom: 10,
    height: 80,
  },
  avatarImageHeader: {
    width: 50,
    height: 50,
    borderRadius: 50,
  },
  avatarImage: {
    width: 70,
    height: 70,
    borderRadius: 50,
  },
  avatarText: {
    color: '#ffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
    color: '#000',
  },

  email: {
    fontSize: 14,
    color: '#bbb',
    fontWeight: 'bold',
    height: 20,
    overflow: 'hidden',
  },
});
