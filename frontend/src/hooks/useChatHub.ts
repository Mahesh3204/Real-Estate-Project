import { useEffect, useRef, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAppDispatch } from '../store/hooks';
import {
  addMessage,
  setConnectionState,
  setUserTyping,
  updateConversation,
} from '../store/chatSlice';
import { addNotification } from '../store/notificationSlice';

const HUB_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5242') + '/hubs/chat';
const NOTIF_HUB_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5242') + '/hubs/notifications';

export function useChatHub() {
  const dispatch = useAppDispatch();
  const chatConnectionRef = useRef<signalR.HubConnection | null>(null);
  const notifConnectionRef = useRef<signalR.HubConnection | null>(null);

  const startConnections = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    // ── Chat Hub ──────────────────────────────────────────────────────────────
    if (!chatConnectionRef.current) {
      const chatConn = new signalR.HubConnectionBuilder()
        .withUrl(HUB_URL, {
          accessTokenFactory: () => token,
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Warning)
        .build();

      chatConn.on('ReceiveMessage', (message) => {
        dispatch(addMessage(message));
      });

      chatConn.on('ConversationUpdated', (conversation) => {
        dispatch(updateConversation(conversation));
      });

      chatConn.on('UserTyping', (data: { conversationId: string; userId: string; isTyping: boolean }) => {
        dispatch(setUserTyping(data));
      });

      chatConn.onreconnecting(() => dispatch(setConnectionState('Connecting')));
      chatConn.onreconnected(() => dispatch(setConnectionState('Connected')));
      chatConn.onclose(() => dispatch(setConnectionState('Disconnected')));

      try {
        dispatch(setConnectionState('Connecting'));
        await chatConn.start();
        dispatch(setConnectionState('Connected'));
        chatConnectionRef.current = chatConn;
      } catch (err) {
        console.error('Chat hub connection failed:', err);
        dispatch(setConnectionState('Disconnected'));
      }
    }

    // ── Notifications Hub ─────────────────────────────────────────────────────
    if (!notifConnectionRef.current) {
      const notifConn = new signalR.HubConnectionBuilder()
        .withUrl(NOTIF_HUB_URL, {
          accessTokenFactory: () => token,
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Warning)
        .build();

      notifConn.on('ReceiveNotification', (notification) => {
        dispatch(addNotification(notification));
      });

      try {
        await notifConn.start();
        notifConnectionRef.current = notifConn;
      } catch (err) {
        console.error('Notification hub connection failed:', err);
      }
    }
  }, [dispatch]);

  const sendTyping = useCallback(
    (conversationId: string, isTyping: boolean) => {
      chatConnectionRef.current
        ?.invoke('SendTypingState', conversationId, isTyping)
        .catch(console.error);
    },
    []
  );

  const stopConnections = useCallback(async () => {
    await chatConnectionRef.current?.stop();
    await notifConnectionRef.current?.stop();
    chatConnectionRef.current = null;
    notifConnectionRef.current = null;
  }, []);

  useEffect(() => {
    startConnections();
    return () => {
      stopConnections();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { sendTyping };
}
