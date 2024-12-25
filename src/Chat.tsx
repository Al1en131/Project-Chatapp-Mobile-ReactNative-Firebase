import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {db} from './config/firebase';
import {
  collection,
  addDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  updateDoc,
} from 'firebase/firestore';

export function Chat(props: any) {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const {user, friend} = props;
  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {
    const ensureConversation = async () => {
      try {
        const conversationsRef = collection(db, 'conversations');
        const q = query(
          conversationsRef,
          where('participants', 'array-contains', user.id),
        );
        const snapshot = await getDocs(q);
        const conversation = snapshot.docs.find(doc =>
          doc.data().participants.includes(friend.id),
        );

        if (conversation) {
          setConversationId(conversation.id);
        } else {
          const newConversationRef = await addDoc(conversationsRef, {
            participants: [user.id, friend.id],
            isTyping: {[user.id]: false, [friend.id]: false},
            lastMessage: null,
          });
          setConversationId(newConversationRef.id);
        }
      } catch (error) {
        console.error('Error ensuring conversation:', error);
      }
    };

    ensureConversation();
  }, [user.id, friend.id]);

  // Fetch messages
  useEffect(() => {
    if (!conversationId) return;

    const fetchMessages = () => {
      const messagesRef = collection(
        db,
        `conversations/${conversationId}/messages`,
      );
      const q = query(messagesRef, orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(q, querySnapshot => {
        const newMessages = querySnapshot.docs.map(doc => ({
          _id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(),
        }));
        setMessages(newMessages);
      });

      return unsubscribe;
    };

    const unsubscribe = fetchMessages();

    return () => {
      unsubscribe();
    };
  }, [conversationId]);

  const sendMessage = useCallback(async () => {
    if (!messageText.trim() || !conversationId) return;

    try {
      const messagesRef = collection(
        db,
        `conversations/${conversationId}/messages`,
      );
      await addDoc(messagesRef, {
        text: messageText.trim(),
        createdAt: new Date(),
        senderId: user.id,
        receiverId: friend.id,
        seen: false,
        user: {id: user.id, name: user.name, avatar: user.avatar},
      });

      await updateDoc(doc(db, 'conversations', conversationId), {
        lastMessage: messageText.trim(),
        [`unseen.${friend.id}`]: true,
      });

      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, [messageText, conversationId, user, friend]);

  // Render each message
  const renderMessage = ({item}: any) => {
    const isOwnMessage = item.senderId === user.id;
    return (
      <View
        style={[
          styles.messageContainer,
          isOwnMessage ? styles.ownMessage : styles.friendMessage,
        ]}>
        <View
          style={[
            styles.bubble,
            isOwnMessage ? styles.ownBubble : styles.friendBubble,
          ]}>
          <Text
            style={[
              styles.bubble,
              isOwnMessage ? styles.ownBubbleText : styles.friendBubbleText,
            ]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item._id}
        inverted
      />
      <View style={styles.inputContainer}>
        <TextInput
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Type a message"
          placeholderTextColor={'#D45588'}
          style={styles.input}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>
            <Image
              source={require('./assets/images/send.png')} style={{width: 30, height: 30}}
            />
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFEBF2',
  },
  messageContainer: {
    marginVertical: 5,
    paddingHorizontal: 10,
    maxWidth: '80%',
  },

  ownMessage: {
    alignSelf: 'flex-end',
  },

  friendMessage: {
    alignSelf: 'flex-start',
    color: '#DE6398',
  },

  bubble: {
    paddingVertical: 6,
    paddingHorizontal: 13,
    borderRadius: 20,
    minWidth: 50,
  },

  friendBubble: {
    borderColor: '#DE6398',
    borderWidth: 1.5,
    borderBottomLeftRadius: 0,
  },

  ownBubble: {
    backgroundColor: '#DE6398',
    borderBottomRightRadius: 0,
  },
  friendBubbleText: {
    color: '#DE6398',
    fontSize: 16,
    lineHeight: 22,
  },
  ownBubbleText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
  },

  inputContainer: {
    backgroundColor: '#D45588',
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 15,
    marginTop: 20,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: '#FFEBF2',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#D45588',
    color: '#D45588',
  },
  sendButton: {
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,

  },
  sendButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
