import React, { useEffect, useState, useCallback } from 'react';
import { FiSearch, FiMessageSquare, FiWifi, FiWifiOff } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  setConversations,
  setMessages,
  setCurrentConversationId,
  markMessagesAsRead,
} from '../../store/chatSlice';
import { chatApi } from '../../services/communicationApi';
import { useChatHub } from '../../hooks/useChatHub';
import ChatWindow from '../../components/Communication/ChatWindow';

const MessengerPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { conversations, messages, currentConversationId, connectionState } = useAppSelector((s) => s.chat);
  const { user } = useAppSelector((s) => s.auth);
  const { sendTyping } = useChatHub();

  const [search, setSearch] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  // Load all conversations on mount
  useEffect(() => {
    const load = async () => {
      try {
        setLoadingConversations(true);
        const { data } = await chatApi.getConversations();
        dispatch(setConversations(data));
      } catch { /* noop */ }
      finally { setLoadingConversations(false); }
    };
    load();
  }, [dispatch]);

  // Load messages when conversation changes
  useEffect(() => {
    if (!currentConversationId) return;
    const load = async () => {
      try {
        setLoadingMessages(true);
        const { data } = await chatApi.getMessages(currentConversationId);
        dispatch(setMessages({ conversationId: currentConversationId, messages: data }));
        // Mark as read
        await chatApi.markAsRead(currentConversationId);
        dispatch(markMessagesAsRead(currentConversationId));
      } catch { /* noop */ }
      finally { setLoadingMessages(false); }
    };
    load();
  }, [currentConversationId, dispatch]);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!currentConversationId) return;
    setSending(true);
    try {
      await chatApi.sendMessage(currentConversationId, content);
    } catch { /* noop */ }
    finally { setSending(false); }
  }, [currentConversationId]);

  const handleTyping = useCallback((isTyping: boolean) => {
    if (currentConversationId) sendTyping(currentConversationId, isTyping);
  }, [currentConversationId, sendTyping]);

  const filtered = conversations.filter((c) => {
    const q = search.toLowerCase();
    return (
      (c.propertyName || '').toLowerCase().includes(q) ||
      (c.buyerName || '').toLowerCase().includes(q) ||
      (c.sellerName || '').toLowerCase().includes(q)
    );
  });

  const currentConversation = conversations.find((c) => c.id === currentConversationId);
  const currentMessages = currentConversationId ? (messages[currentConversationId] || []) : [];

  const formatTime = (dt: string) => {
    const d = new Date(dt);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getConversationTitle = (c: typeof conversations[0]) => {
    if (user?.id === c.buyerId) return c.sellerName || 'Seller';
    return c.buyerName || 'Buyer';
  };

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden rounded-2xl"
      style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid var(--border)' }}>

      {/* Sidebar: Conversation List */}
      <div className="w-80 flex-shrink-0 flex flex-col border-r" style={{ borderColor: 'var(--border)' }}>
        {/* Header */}
        <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-lg" style={{ fontFamily: 'var(--heading)', color: 'var(--text-primary)' }}>
              Messages
            </h2>
            <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
              style={{
                background: connectionState === 'Connected' ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
                color: connectionState === 'Connected' ? 'var(--success)' : 'var(--error)',
                border: `1px solid ${connectionState === 'Connected' ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`,
              }}>
              {connectionState === 'Connected' ? <FiWifi size={11} /> : <FiWifiOff size={11} />}
              {connectionState}
            </div>
          </div>
          <div className="relative">
            <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl text-xs outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            />
          </div>
        </div>

        {/* Conversation Items */}
        <div className="flex-1 overflow-y-auto">
          {loadingConversations ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 rounded-full animate-spin"
                style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 px-4">
              <FiMessageSquare size={28} style={{ color: 'var(--text-secondary)', margin: '0 auto 8px' }} />
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {search ? 'No matching conversations' : 'No conversations yet'}
              </p>
            </div>
          ) : (
            filtered.map((conv) => {
              const isActive = conv.id === currentConversationId;
              return (
                <button
                  key={conv.id}
                  onClick={() => dispatch(setCurrentConversationId(conv.id))}
                  className="w-full flex items-start gap-3 p-4 text-left transition-all border-b"
                  style={{
                    background: isActive ? 'rgba(183,94,255,0.1)' : 'transparent',
                    borderColor: 'var(--border)',
                    borderRight: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm"
                    style={{ background: 'rgba(183,94,255,0.15)', color: 'var(--accent)' }}>
                    {(getConversationTitle(conv)[0] || 'U').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm truncate"
                        style={{ color: 'var(--text-primary)' }}>
                        {getConversationTitle(conv)}
                      </span>
                      <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>
                        {formatTime(conv.lastMessageAt || conv.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--accent)', opacity: 0.7 }}>
                      {conv.propertyName}
                    </p>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                        {conv.lastMessageContent || 'Start a conversation'}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="flex-shrink-0 ml-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                          style={{ background: 'var(--accent)', color: '#fff' }}>
                          {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {!currentConversationId ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(183,94,255,0.08)', border: '1px solid rgba(183,94,255,0.15)' }}>
                <FiMessageSquare size={36} style={{ color: 'var(--accent)', opacity: 0.6 }} />
              </div>
              <div>
                <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)', fontFamily: 'var(--heading)' }}>
                  Select a conversation
                </h3>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Choose a conversation from the left to start messaging
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Conversation Header */}
            <div className="flex items-center gap-4 px-6 py-4 border-b"
              style={{ borderColor: 'var(--border)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
                style={{ background: 'rgba(183,94,255,0.15)', color: 'var(--accent)' }}>
                {(getConversationTitle(currentConversation!)[0] || 'U').toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {getConversationTitle(currentConversation!)}
                </h3>
                <p className="text-xs" style={{ color: 'var(--accent)', opacity: 0.8 }}>
                  {currentConversation?.propertyName}
                </p>
              </div>
            </div>

            {/* Messages */}
            {loadingMessages ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-8 h-8 border-2 rounded-full animate-spin"
                  style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
              </div>
            ) : (
              <div className="flex-1 overflow-hidden">
                <ChatWindow
                  conversationId={currentConversationId}
                  messages={currentMessages}
                  onSendMessage={handleSendMessage}
                  onTyping={handleTyping}
                  sending={sending}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MessengerPage;
