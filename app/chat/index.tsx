import { Colors } from '@/constants/Colors';
import { useT } from '@/i18n/useT';
import { chatService } from '@/services/chat.service';
import { ChatMessage } from '@/types/chat';
import { router } from 'expo-router';
import { ArrowLeft, Bot, Send } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChatScreen() {
  const t = useT();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: t('chat.intro') },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const listRef = useRef<FlatList>(null);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setLoading(true);
    try {
      const res = await chatService.sendMessage(text, sessionId);
      setSessionId(res.sessionId);
      setMessages((prev) => [...prev, { role: 'assistant', content: res.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: t('chat.error') }]);
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.surface }}>
        <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
          <ArrowLeft size={22} color={Colors.textPrimary} strokeWidth={1.5} />
        </Pressable>
        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
          <Bot size={20} color={Colors.primary} strokeWidth={1.5} />
        </View>
        <View>
          <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.textPrimary }}>{t('chat.title')}</Text>
          <Text style={{ fontSize: 12, color: Colors.success }}>{t('chat.online')}</Text>
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => {
          const isUser = item.role === 'user';
          return (
            <Animated.View
              entering={isUser ? FadeInUp.springify() : FadeInDown.springify()}
              style={{ flexDirection: 'row', justifyContent: isUser ? 'flex-end' : 'flex-start', gap: 8 }}
            >
              {!isUser && (
                <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
                  <Bot size={16} color={Colors.primary} strokeWidth={1.5} />
                </View>
              )}
              <View style={{
                maxWidth: '75%',
                backgroundColor: isUser ? Colors.primary : Colors.surface,
                borderRadius: 16,
                borderBottomRightRadius: isUser ? 4 : 16,
                borderBottomLeftRadius: isUser ? 16 : 4,
                padding: 12,
                shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
              }}>
                <Text style={{ fontSize: 14, color: isUser ? Colors.white : Colors.textPrimary, lineHeight: 20 }}>
                  {item.content}
                </Text>
              </View>
            </Animated.View>
          );
        }}
        ListFooterComponent={loading ? (
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={16} color={Colors.primary} strokeWidth={1.5} />
            </View>
            <View style={{ backgroundColor: Colors.surface, borderRadius: 16, borderBottomLeftRadius: 4, padding: 12 }}>
              <Text style={{ color: Colors.textSecondary, fontSize: 14 }}>{t('chat.typing')}</Text>
            </View>
          </View>
        ) : null}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
        <View style={{
          flexDirection: 'row', padding: 12, gap: 10, alignItems: 'flex-end',
          borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.surface,
        }}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={t('chat.placeholder')}
            placeholderTextColor={Colors.textDisabled}
            multiline
            style={{
              flex: 1, backgroundColor: Colors.background, borderRadius: 20,
              paddingHorizontal: 16, paddingVertical: 10,
              fontSize: 14, color: Colors.textPrimary, maxHeight: 100,
            }}
          />
          <Pressable
            onPress={send}
            disabled={!input.trim() || loading}
            style={{
              width: 42, height: 42, borderRadius: 21,
              backgroundColor: input.trim() && !loading ? Colors.primary : Colors.border,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Send size={18} color={Colors.white} strokeWidth={1.5} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
