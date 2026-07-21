import React, { useEffect, useRef, useState } from 'react';
import { FiSend } from 'react-icons/fi';
import { useAppSelector } from '../../store/hooks';
import type { MessageDto } from '../../store/chatSlice';

interface ChatWindowProps {
  conversationId: string;
  messages: MessageDto[];
  onSendMessage: (content: string) => void;
  onTyping?: (isTyping: boolean) => void;
  sending?: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  conversationId,
  messages,
  onSendMessage,
  onTyping,
  sending = false,
}) => {
  const { user } = useAppSelector((s) => s.auth);
  const { typingUsers } = useAppSelector((s) => s.chat);
  const [text, setText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const typing = typingUsers[conversationId] || [];
  const othersTyping = typing.filter((id) => id !== user?.id);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    onTyping?.(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => onTyping?.(false), 2000);
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    onSendMessage(trimmed);
    setText('');
    onTyping?.(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dt: string) =>
    new Date(dt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const formatDate = (dt: string) =>
    new Date(dt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  // Group messages by date
  const grouped: { date: string; messages: MessageDto[] }[] = [];
  messages.forEach((msg) => {
    const date = new Date(msg.createdAt).toDateString();
    const last = grouped[grouped.length - 1];
    if (last && last.date === date) {
      last.messages.push(msg);
    } else {
      grouped.push({ date, messages: [msg] });
    }
  });

  const renderMessageContent = (msg: MessageDto) => {
    if (msg.contentType === 3) {
      // Offer card
      try {
        const data = JSON.parse(msg.content);
        return (
          <div className="rounded-xl p-4 flex flex-col gap-2"
            style={{ background: 'rgba(183,94,255,0.12)', border: '1px solid rgba(183,94,255,0.25)', minWidth: '220px' }}>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
                💼 Offer Update
              </span>
            </div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              ${Number(data.amount || 0).toLocaleString()}
            </p>
            {data.status && (
              <span className="text-xs px-2 py-0.5 rounded-md self-start"
                style={{ background: 'rgba(183,94,255,0.2)', color: 'var(--accent)' }}>
                {data.status}
              </span>
            )}
            {data.message && (
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{data.message}</p>
            )}
          </div>
        );
      } catch {
        return <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{msg.content}</p>;
      }
    }
    return <p className="text-sm whitespace-pre-wrap break-words" style={{ color: 'var(--text-primary)' }}>{msg.content}</p>;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-center">
            <div className="flex flex-col items-center gap-3 py-10">
              <div className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(183,94,255,0.1)', border: '1px solid rgba(183,94,255,0.2)' }}>
                <FiSend size={22} style={{ color: 'var(--accent)' }} />
              </div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Start the conversation
              </p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)', opacity: 0.7 }}>
                Send a message to get the conversation going
              </p>
            </div>
          </div>
        ) : (
          grouped.map((group) => (
            <div key={group.date}>
              {/* Date separator */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                <span className="text-xs px-3 py-1 rounded-full"
                  style={{ color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
                  {formatDate(group.messages[0].createdAt)}
                </span>
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              </div>

              {/* Messages in this date group */}
              {group.messages.map((msg, idx) => {
                const isMine = msg.senderId === user?.id;
                const prevMsg = idx > 0 ? group.messages[idx - 1] : null;
                const showAvatar = !prevMsg || prevMsg.senderId !== msg.senderId;

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2 ${isMine ? 'justify-end' : 'justify-start'} ${showAvatar ? 'mt-3' : 'mt-0.5'}`}
                  >
                    {!isMine && showAvatar && (
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                        style={{ background: 'rgba(183,94,255,0.15)', color: 'var(--accent)', marginTop: '2px' }}>
                        {(msg.senderName?.[0] || 'U').toUpperCase()}
                      </div>
                    )}
                    {!isMine && !showAvatar && <div className="w-7 flex-shrink-0" />}

                    <div className={`max-w-[70%] flex flex-col gap-0.5 ${isMine ? 'items-end' : 'items-start'}`}>
                      <div
                        className="px-4 py-2.5 rounded-2xl"
                        style={{
                          background: isMine ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
                          borderRadius: isMine
                            ? (showAvatar ? '18px 18px 4px 18px' : '18px 4px 4px 18px')
                            : (showAvatar ? '18px 18px 18px 4px' : '4px 18px 18px 4px'),
                          border: isMine ? 'none' : '1px solid var(--border)',
                        }}
                      >
                        {renderMessageContent(msg)}
                      </div>
                      <div className="flex items-center gap-1.5 px-1">
                        <span className="text-xs" style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>
                          {formatTime(msg.createdAt)}
                        </span>
                        {isMine && (
                          <span className="text-xs" style={{ color: msg.isRead ? 'var(--accent)' : 'var(--text-secondary)', opacity: 0.7 }}>
                            {msg.isRead ? '✓✓' : msg.isDelivered ? '✓✓' : '✓'}
                          </span>
                        )}
                      </div>
                    </div>

                    {isMine && showAvatar && (
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                        style={{ background: 'var(--accent)', color: '#fff', marginTop: '2px' }}>
                        {(user?.firstName?.[0] || 'U').toUpperCase()}
                      </div>
                    )}
                    {isMine && !showAvatar && <div className="w-7 flex-shrink-0" />}
                  </div>
                );
              })}
            </div>
          ))
        )}

        {/* Typing indicator */}
        {othersTyping.length > 0 && (
          <div className="flex items-center gap-2 mt-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: 'rgba(183,94,255,0.15)', color: 'var(--accent)' }}>?</div>
            <div className="px-4 py-2.5 rounded-2xl flex items-center gap-1"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--text-secondary)', animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--text-secondary)', animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--text-secondary)', animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-end gap-3">
          <textarea
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Enter to send)"
            rows={1}
            className="flex-1 rounded-xl px-4 py-3 text-sm resize-none outline-none"
            style={{
              background: 'var(--input-bg)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              maxHeight: '120px',
              overflowY: 'auto',
              fontFamily: 'var(--sans)',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
            style={{
              background: text.trim() && !sending ? 'var(--accent)' : 'rgba(183,94,255,0.2)',
              border: 'none',
              cursor: text.trim() && !sending ? 'pointer' : 'not-allowed',
              color: '#fff',
            }}
          >
            {sending ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <FiSend size={16} />
            )}
          </button>
        </div>
        <p className="text-xs mt-1.5" style={{ color: 'var(--text-secondary)', opacity: 0.5 }}>
          Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default ChatWindow;
