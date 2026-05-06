import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
  SafeAreaView, ActivityIndicator
} from 'react-native';
import { format } from 'date-fns';
import { useMessages } from '../hooks/useMessages';

export default function MessagesScreen({ route, navigation }) {
  const { listingId, otherUserId, otherName, context } = route.params;
  const [inputText, setInputText] = useState(context || '');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);

  const { messages, loading, sendMessage, currentUserId } = useMessages(listingId, otherUserId);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || sending) return;

    setInputText('');
    setSending(true);
    try {
      await sendMessage(text);
    } catch (e) {
      setInputText(text); // restore on error
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item, index }) => {
    const isMe = item.sender_id === currentUserId;
    const showDate = index === 0 ||
      new Date(item.created_at).toDateString() !== new Date(messages[index - 1].created_at).toDateString();

    return (
      <>
        {showDate && (
          <Text style={styles.dateDivider}>
            {format(new Date(item.created_at), 'EEEE, MMM d')}
          </Text>
        )}
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
          <Text style={[styles.bubbleText, isMe ? styles.bubbleTextMe : styles.bubbleTextThem]}>
            {item.body}
          </Text>
          <Text style={[styles.bubbleTime, isMe ? styles.bubbleTimeMe : styles.bubbleTimeThem]}>
            {format(new Date(item.created_at), 'h:mm a')}
            {isMe && ' · ' + (item.read ? '✓✓' : '✓')}
          </Text>
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>{otherName?.[0]?.toUpperCase() || '?'}</Text>
          </View>
          <View>
            <Text style={styles.headerName}>{otherName || 'Student'}</Text>
            {listingId && <Text style={styles.headerSub}>Re: sublease listing</Text>}
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {loading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator color="#FF6B35" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyConvo}>
                <Text style={styles.emptyEmoji}>💬</Text>
                <Text style={styles.emptyText}>Send your first message!</Text>
                <Text style={styles.emptyHint}>Be direct — introduce yourself and ask your question</Text>
              </View>
            }
          />
        )}

        {/* Input */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor="#404060"
            multiline
            maxLength={1000}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!inputText.trim() || sending) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || sending}
          >
            {sending
              ? <ActivityIndicator color="#FFF" size="small" />
              : <Text style={styles.sendBtnText}>↑</Text>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#16161E',
  },
  backBtn: { marginRight: 12, padding: 4 },
  backText: { color: '#FF6B35', fontSize: 22 },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  headerAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#FF6B35', alignItems: 'center', justifyContent: 'center',
  },
  headerAvatarText: { color: '#FFF', fontWeight: '900', fontSize: 15 },
  headerName: { color: '#FAFAFA', fontSize: 15, fontWeight: '700' },
  headerSub: { color: '#5050A0', fontSize: 11 },
  loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  messagesList: { padding: 16, paddingBottom: 8 },
  dateDivider: {
    color: '#404060', fontSize: 11, textAlign: 'center',
    marginVertical: 12, fontWeight: '600',
  },
  bubble: {
    maxWidth: '78%', marginBottom: 8,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18,
  },
  bubbleMe: {
    alignSelf: 'flex-end', backgroundColor: '#FF6B35',
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    alignSelf: 'flex-start', backgroundColor: '#16161E',
    borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#2A2A3A',
  },
  bubbleText: { fontSize: 15, lineHeight: 20 },
  bubbleTextMe: { color: '#FFF' },
  bubbleTextThem: { color: '#FAFAFA' },
  bubbleTime: { fontSize: 10, marginTop: 4 },
  bubbleTimeMe: { color: 'rgba(255,255,255,0.6)', textAlign: 'right' },
  bubbleTimeThem: { color: '#404060' },
  emptyConvo: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 52, marginBottom: 12 },
  emptyText: { color: '#FAFAFA', fontSize: 18, fontWeight: '800', marginBottom: 6 },
  emptyHint: { color: '#5050A0', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: '#16161E',
    backgroundColor: '#0A0A0F',
  },
  input: {
    flex: 1, backgroundColor: '#16161E',
    borderRadius: 22, borderWidth: 1, borderColor: '#2A2A3A',
    color: '#FAFAFA', fontSize: 15,
    paddingHorizontal: 14, paddingVertical: 10,
    maxHeight: 100,
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#FF6B35', alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.35 },
  sendBtnText: { color: '#FFF', fontSize: 20, fontWeight: '900' },
});
