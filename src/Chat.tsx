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

  // Ensure the conversation exists
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

  // Send a new message
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

      setMessageText(''); // Clear input
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
        <Text style={styles.messageText}>{item.text}</Text>
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
          style={styles.input}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  messageContainer: {
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 8,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#b3e6ff',
  },
  friendMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#d3d3d3',
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderColor: '#cccccc',
  },
  input: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cccccc',
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#007bff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  sendButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
