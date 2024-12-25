import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import {collection, getDocs, onSnapshot, doc, setDoc} from 'firebase/firestore';
import {db} from './config/firebase';
import {Chat} from './Chat';

export function Friends({user, onLogout}: any) {
  const [users, setUsers] = useState<any>([]);
  const [friend, setFriend] = useState<any>(null);
  const [curentUser, setCurentUser] = useState(null);
  const [conversations, setConversations] = useState<any>([]);
  const [activeTab, setActiveTab] = useState('Chats'); // Tab aktif

  useEffect(() => {
    const fetchConversations = () => {
      const conversationRef = collection(db, 'conversations');
      const unsubscribe = onSnapshot(conversationRef, snapshot => {
        const updatedConversations: any = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter(
            (conversation: any) =>
              conversation.participants.includes(curentUser?.id), 
          );
        updatedConversations.sort(
          (a: any, b: any) => b.timestamp - a.timestamp,
        );

        setConversations(updatedConversations);
      });

      return () => unsubscribe();
    };

    if (curentUser) {
      fetchConversations();
    }
  }, [curentUser]);

  useEffect(() => {
    const fetchUsers = async () => {
      const usersCollection = collection(db, 'users');
      const snapshot = await getDocs(usersCollection);
      const usersList: any = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCurentUser(usersList.find((x: any) => x.name === user.email));
      setUsers(usersList.filter((x: any) => x.name !== user?.email));
    };

    fetchUsers();
  }, [user.email]);

  const getInitials = (email: string) => {
    if (!email) return 'NA';
    const parts = email.split('@')[0].split('.');
    return parts.length > 1
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : parts[0][0].toUpperCase();
  };

  const navigateToChatRoom = async (selectedUser: any) => {
    const conversationExists = conversations.find((c: any) =>
      c.participants?.every((id: any) =>
        [curentUser?.id, selectedUser.id].includes(id),
      ),
    );

    if (!conversationExists) {
      const newConversation = {
        participants: [curentUser?.id, selectedUser.id],
        messages: [],
        lastMessage: '',
        timestamp: Date.now(),
        seenBy: [curentUser?.id],
      };

      const conversationRef = doc(collection(db, 'conversations'));
      await setDoc(conversationRef, newConversation);
    }

    setFriend(selectedUser);
  };

  const renderChat = ({item}: any) => {
    if (!item.lastMessage) return null;

    const friendId = item.participants.find((id: any) => id !== curentUser?.id);
    const friendData = users.find((u: any) => u.id === friendId);

    if (!friendData) return null; 

    const isUnseen = !item.seenBy?.includes(curentUser?.id);

    return (
      <TouchableOpacity
        style={[
          styles.userCard,
          isUnseen && styles.unseenCard, 
        ]}
        onPress={() => setFriend(friendData)}>
        <View style={styles.avatarContainer}>
          {friendData?.avatar ? (
            <Image
              source={{uri: friendData.avatar}}
              style={styles.avatarImage}
            />
          ) : (
            <Text style={styles.avatarText}>
              {getInitials(friendData?.name || '')}
            </Text>
          )}
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.name}>{friendData?.name || 'Unknown'}</Text>
          <Text style={styles.email}>{item.lastMessage}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderUser = ({item}: any) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => navigateToChatRoom(item)}>
      <View style={styles.avatarContainer}>
        {item.avatar ? (
          <Image source={{uri: item.avatar}} style={[styles.avatarImage]} />
        ) : (
          <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
        )}
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.name}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  if (friend) {
    return (
      <View style={styles.container}>
        <View style={styles.headerChat}>
          <View style={{alignItems: 'flex-start'}}>
            <View style={styles.friendInfo}>
              {friend?.avatar ? (
                <Image
                  source={{uri: friend?.avatar}}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text
                    style={{color: '#D45588', fontWeight: 600, fontSize: 22}}>
                    {getInitials(friend?.name || '')}
                  </Text>
                </View>
              )}
              <Text style={styles.friendName}>{friend?.name || 'Unknown'}</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setFriend(null)}
            style={styles.backButton}>
            <Text style={styles.backButtonText}>
              <Image
                source={require('./assets/images/ArrowLeft.png')}
                style={styles.logo}
              />
            </Text>
          </TouchableOpacity>
        </View>
        <Chat friend={friend} user={curentUser} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
          <Text
            style={[styles.tab, activeTab === 'Chats' && styles.activeTab]}
            onPress={() => setActiveTab('Chats')}>
            Chats
          </Text>
          <Text
            style={[styles.tab, activeTab === 'Friends' && styles.activeTab]}
            onPress={() => setActiveTab('Friends')}>
            Friends
          </Text>
        </View>
        <FlatList
          data={activeTab === 'Chats' ? conversations : users}
          keyExtractor={(item: any) => item.id}
          renderItem={activeTab === 'Chats' ? renderChat : renderUser}
          contentContainerStyle={styles.list}
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
  unseenCard: {
    backgroundColor: '#FCE4EC',
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
    marginBottom: 15,
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
    fontWeight: '500',
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
    borderColor: '#D45588',
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
    color: '#D45588',
    fontSize: 16,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 14,
    color: '#FB9EC6',
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
    borderWidth: 1.4,
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
    fontSize: 15,
    color: '#E86BA1',
    height: 20,
    overflow: 'hidden',
  },
  headerChat: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#D45588',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    width: '100%',
  },

  backButton: {},
  backButtonText: {
    color: 'white',
    width: 30,
    height: 30,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendName: {
    fontSize: 18,
    color: 'white',
    marginLeft: 10,
  },
});
