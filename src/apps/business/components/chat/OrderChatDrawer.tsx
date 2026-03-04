import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, Image, Trash2, MessageCircle, Lock, ShieldAlert } from 'lucide-react';
import { apiClient, chatService } from '../../../../lib/api';
import { useAuth } from '../../../../context/AuthContext';
import type { Order } from '../../../../types';
import type { OrderChat, OrderMessage } from '../../../../lib/api';

interface OrderChatDrawerProps {
  order: Order;
  onClose: () => void;
  senderRole?: 'customer' | 'store' | 'admin';
  senderName?: string;
}

export default function OrderChatDrawer({ order, onClose, senderRole = 'customer', senderName }: OrderChatDrawerProps) {
  const { user } = useAuth();
  const [chat, setChat] = useState<OrderChat | null>(null);
  const [messages, setMessages] = useState<OrderMessage[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingChat, setLoadingChat] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resolvedSenderName = senderName || user?.email?.split('@')[0] || 'Utilisateur';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadOrCreateChat = useCallback(async () => {
    setLoadingChat(true);
    try {
      const { data: existing, error: fetchError } = await chatService.getChatByOrder(order.id);

      if (existing) {
        setChat(existing);
        return existing;
      }

      if (fetchError && fetchError.code !== 'HTTP_404') {
        throw fetchError;
      }

      const { data: created, error: createError } = await chatService.createChat(order.id);
      if (createError) throw createError;
      setChat(created);
      return created;
    } catch (err) {
      console.error('Error loading/creating chat:', err);
      return null;
    } finally {
      setLoadingChat(false);
    }
  }, [order.id]);

  const loadMessages = useCallback(async (chatId: string) => {
    const { data, error } = await chatService.getMessages(chatId);

    if (!error && data) {
      setMessages(data as OrderMessage[]);
      setTimeout(scrollToBottom, 100);
    }
  }, []);

  useEffect(() => {
    let currentChat: OrderChat | null = null;

    const init = async () => {
      currentChat = await loadOrCreateChat();
      if (!currentChat) return;

      await loadMessages(currentChat.id);

      pollingIntervalRef.current = setInterval(async () => {
        if (!currentChat) return;
        const { data: updatedMessages } = await chatService.getMessages(currentChat.id);
        if (updatedMessages) {
          setMessages(prev => {
            const optimisticIds = new Set(prev.filter(m => m.id.startsWith('optimistic-')).map(m => m.id));
            const merged = updatedMessages as OrderMessage[];
            if (optimisticIds.size > 0) {
              const optimisticMsgs = prev.filter(m => m.id.startsWith('optimistic-'));
              return [...merged, ...optimisticMsgs];
            }
            return merged;
          });
        }
        const { data: updatedChat } = await chatService.getChatByOrder(order.id);
        if (updatedChat) {
          setChat(updatedChat);
        }
      }, 5000);
    };

    init();

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [loadOrCreateChat, loadMessages, order.id]);

  const isChatClosed = () => {
    if (!chat) return true;
    if (chat.litige_resolved) return true;
    if (!chat.is_open && (order.status === 'cancelled' || order.status === 'refunded' || order.status === 'delivered')) {
      return senderRole !== 'admin';
    }
    return false;
  };

  const canSendMessage = () => {
    if (!chat) return false;
    if (chat.litige_resolved) return false;
    if (!chat.is_open) {
      return senderRole === 'admin';
    }
    return true;
  };

  const sendMessage = async (contentType: 'text' | 'image' = 'text', imageUrl?: string) => {
    if (!chat || !user) return;
    if (contentType === 'text' && !text.trim()) return;
    if (!canSendMessage()) return;

    const messageContent = contentType === 'text' ? text.trim() : undefined;
    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticMsg: OrderMessage = {
      id: optimisticId,
      chat_id: chat.id,
      order_id: order.id,
      sender_id: user.id,
      sender_role: senderRole,
      sender_name: resolvedSenderName,
      content: messageContent,
      image_url: contentType === 'image' ? imageUrl : undefined,
      content_type: contentType,
      is_deleted: false,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, optimisticMsg]);
    if (contentType === 'text') setText('');
    setTimeout(scrollToBottom, 50);

    setSending(true);
    try {
      const { data: inserted, error } = await chatService.sendMessage(chat.id, order.id, {
        sender_id: user.id,
        sender_role: senderRole,
        sender_name: resolvedSenderName,
        message: messageContent || '',
        attachment_url: contentType === 'image' ? imageUrl : undefined,
      });

      if (error) {
        setMessages(prev => prev.filter(m => m.id !== optimisticId));
        if (contentType === 'text') setText(messageContent || '');
      } else if (inserted) {
        setMessages(prev => prev.map(m => m.id === optimisticId ? inserted as OrderMessage : m));
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setMessages(prev => prev.filter(m => m.id !== optimisticId));
      if (contentType === 'text') setText(messageContent || '');
    } finally {
      setSending(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!user || !chat) return;
    setUploadingImage(true);
    try {
      const { data: uploadData, error: uploadError } = await apiClient.upload(
        `/uploads/chat/${chat.id}`,
        file,
        { chat_id: chat.id }
      );
      if (uploadError) throw uploadError;
      await sendMessage('image', uploadData?.url);
    } catch (err) {
      console.error('Error uploading image:', err);
    } finally {
      setUploadingImage(false);
    }
  };

  const deleteMessage = async (msg: OrderMessage) => {
    if (msg.sender_id !== user?.id) return;
    await chatService.deleteMessage(msg.id);
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (ts: string) => {
    return new Date(ts).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  };

  const getDateLabel = (messages: OrderMessage[], idx: number) => {
    if (idx === 0) return formatDate(messages[0].created_at);
    const prev = new Date(messages[idx - 1].created_at).toDateString();
    const curr = new Date(messages[idx].created_at).toDateString();
    if (prev !== curr) return formatDate(messages[idx].created_at);
    return null;
  };

  const getRoleLabel = (role: string) => {
    if (role === 'admin') return 'Admin Plateforme';
    if (role === 'store') return 'Vendeur';
    return 'Client';
  };

  const getRoleColor = (role: string) => {
    if (role === 'admin') return 'bg-red-600';
    if (role === 'store') return 'bg-blue-600';
    return 'bg-emerald-600';
  };

  const isMyMessage = (msg: OrderMessage) => msg.sender_id === user?.id;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="w-full max-w-md bg-white shadow-2xl flex flex-col h-full">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 rounded-xl p-2">
              <MessageCircle size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Commande #{order.id.slice(0, 8).toUpperCase()}</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {chat?.is_litige ? (
                  <span className="flex items-center gap-1 text-amber-400">
                    <ShieldAlert size={11} />
                    Litige en cours
                  </span>
                ) : chat?.litige_resolved ? (
                  <span className="flex items-center gap-1 text-red-400">
                    <Lock size={11} />
                    Chat fermé - Litige résolu
                  </span>
                ) : !chat?.is_open ? (
                  <span className="flex items-center gap-1 text-gray-400">
                    <Lock size={11} />
                    Commande terminée
                  </span>
                ) : (
                  <span className="text-emerald-400">En ligne</span>
                )}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        {chat?.is_litige && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center gap-2">
            <ShieldAlert size={14} className="text-amber-600 shrink-0" />
            <p className="text-xs text-amber-800 font-medium">Un litige est ouvert sur cette commande. L'équipe plateforme est impliquée.</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {loadingChat ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
                <MessageCircle size={28} className="text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500 font-medium">Démarrez la conversation</p>
                <p className="text-xs text-gray-400 mt-1">Envoyez un message au vendeur concernant cette commande</p>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const dateLabel = getDateLabel(messages, idx);
              const mine = isMyMessage(msg);

              return (
                <div key={msg.id}>
                  {dateLabel && (
                    <div className="flex items-center gap-2 my-3">
                      <div className="flex-1 h-px bg-gray-200" />
                      <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full font-medium">{dateLabel}</span>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>
                  )}

                  <div className={`flex ${mine ? 'justify-end' : 'justify-start'} group`}>
                    <div className={`max-w-[75%] ${mine ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                      {!mine && (
                        <div className="flex items-center gap-2 px-1">
                          <span className={`text-xs font-bold text-white px-2 py-0.5 rounded-full ${getRoleColor(msg.sender_role)}`}>
                            {getRoleLabel(msg.sender_role)}
                          </span>
                          <span className="text-xs text-gray-500">{msg.sender_name}</span>
                        </div>
                      )}

                      <div className="relative">
                        {msg.is_deleted ? (
                          <div className="bg-gray-100 border border-gray-200 px-4 py-2.5 rounded-2xl">
                            <p className="text-xs text-gray-400 italic">Message supprimé</p>
                          </div>
                        ) : msg.content_type === 'image' && msg.image_url ? (
                          <div className={`rounded-2xl overflow-hidden shadow-sm border-2 ${mine ? 'border-emerald-200' : 'border-gray-200'}`}>
                            <img
                              src={msg.image_url}
                              alt="Image partagée"
                              className="max-w-full max-h-48 object-cover"
                            />
                          </div>
                        ) : (
                          <div className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                            mine
                              ? msg.sender_role === 'admin'
                                ? 'bg-red-600 text-white'
                                : 'bg-emerald-600 text-white'
                              : msg.sender_role === 'admin'
                                ? 'bg-red-50 text-red-900 border border-red-100'
                                : 'bg-white text-gray-900 border border-gray-200'
                          }`}>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                          </div>
                        )}

                        {mine && !msg.is_deleted && (
                          <button
                            onClick={() => deleteMessage(msg)}
                            className="absolute -top-2 -left-8 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:bg-red-50 hover:border-red-200"
                          >
                            <Trash2 size={11} className="text-gray-400 hover:text-red-500" />
                          </button>
                        )}
                      </div>

                      <span className={`text-xs text-gray-400 px-1 ${mine ? 'text-right' : 'text-left'}`}>
                        {formatTime(msg.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {canSendMessage() ? (
          <div className="border-t border-gray-200 bg-white p-3 shrink-0">
            {senderRole === 'admin' && (
              <div className="flex items-center gap-1.5 mb-2 px-1">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-xs text-red-600 font-semibold">Vous répondez en tant qu'Admin Plateforme</span>
              </div>
            )}
            <div className="flex items-end gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all shrink-0"
              >
                {uploadingImage ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                ) : (
                  <Image size={20} />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                  e.target.value = '';
                }}
              />
              <div className="flex-1 relative">
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Écrivez votre message..."
                  rows={1}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-2xl text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400 resize-none max-h-28 overflow-y-auto"
                  style={{ minHeight: '42px' }}
                />
              </div>
              <button
                onClick={() => sendMessage()}
                disabled={!text.trim() || sending}
                className="p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-all shrink-0 active:scale-95"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div className="border-t border-gray-200 bg-gray-50 p-4 shrink-0">
            <div className="flex items-center gap-2 justify-center text-gray-400">
              <Lock size={16} />
              <span className="text-sm font-medium">
                {chat?.litige_resolved
                  ? 'Chat fermé — litige résolu'
                  : 'Commande terminée — messagerie fermée'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
