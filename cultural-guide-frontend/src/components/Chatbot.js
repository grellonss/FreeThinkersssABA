import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, MapPin, User as UserIcon, Bot, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from "react-i18next";

export function Chatbot({ user, onBack }) {
    const { t, i18n } = useTranslation();
    const storedCountry = localStorage.getItem("cultural_guide_country") || "CH";
    const storedCity = localStorage.getItem("cultural_guide_city") || (storedCountry === "IT" ? "Camerino" : "Olten");

    const [selectedCity, setSelectedCity] = useState(storedCity);
    const [activeCountry, setActiveCountry] = useState(storedCountry);
    const isIt = activeCountry === "IT";

    // Country Theme styles: Bordeaux Red for CH vs Emerald Green for IT
    const themeBgBtn = isIt ? "bg-emerald-700 hover:bg-emerald-800 text-white" : "bg-red-800 hover:bg-red-900 text-white";
    const themeText = isIt ? "text-emerald-700 hover:text-emerald-800" : "text-red-800 hover:text-red-900";
    const themeHighlight = isIt ? "text-emerald-700" : "text-red-800";
    const themeBadgeClass = isIt ? "bg-emerald-50 text-emerald-900 border-emerald-200" : "bg-red-50 text-red-900 border-red-200";
    const themeFocusBorder = isIt ? "focus:border-emerald-600" : "focus:border-red-800";
    const themeUserBubble = isIt ? "bg-emerald-700 text-white" : "bg-red-800 text-white";

    const [messages, setMessages] = useState([
        {
            id: '1',
            text: i18n.language === 'de'
                ? `Hallo ${user?.name || ''}! Ich bin Ihr persönlicher Kulturführer für ${isIt ? 'Italien & ESN Camerino' : 'die Schweiz & ESN Olten'}. Wie kann ich Ihnen bei Ihrem Aufenthalt in ${storedCity} behilflich sein?`
                : i18n.language === 'en'
                    ? `Hello ${user?.name || ''}! I am your Cultural Guide assistant for ${isIt ? 'Italy & ESN Camerino' : 'Switzerland & ESN Olten'}. How can I help you explore ${storedCity} today?`
                    : `Ciao ${user?.name || ''}! Sono il tuo assistente per la Cultural Guide (${isIt ? 'ESN Camerino 🇮🇹' : 'ESN Olten 🇨🇭'}). Come posso aiutarti a scoprire ${storedCity} oggi? Chiedimi cosa visitare, dove mangiare o consigli per studenti!`,
            sender: 'bot',
            timestamp: new Date(),
        },
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const [loading, setLoading] = useState(false);

    const [startSelection, setStartSelection] = useState({ date: null, hour: null });
    const [endSelection, setEndSelection] = useState({ date: null, hour: null });
    const [profileVector, setProfileVector] = useState(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    // Check preferences
    useEffect(() => {
        if (!user) return;

        const checkUserProfileVector = async () => {
            setLoading(true);
            try {
                const userId = user.id || user.email;
                const response = await fetch(
                    `http://localhost:5203/api/eppoiapi/profile-vector/${encodeURIComponent(userId)}`,
                    {
                        method: "GET",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                    }
                );

                if (response.ok) {
                    const vector = await response.json();
                    setProfileVector(vector);
                    if (vector.municipality) setSelectedCity(vector.municipality);
                    if (vector.country) setActiveCountry(vector.country);
                } else {
                    const local = localStorage.getItem("cultural_guide_preferences");
                    if (local) {
                        const parsed = JSON.parse(local);
                        setProfileVector(parsed);
                        if (parsed.municipality) setSelectedCity(parsed.municipality);
                        if (parsed.country) setActiveCountry(parsed.country);
                    }
                }
            } catch (err) {
                console.warn("User preferences sync note:", err);
            } finally {
                setLoading(false);
            }
        };

        checkUserProfileVector();
    }, [user]);

    // Time availability
    useEffect(() => {
        if (!profileVector) return;
        if (profileVector.startTime) {
            const startDate = new Date(profileVector.startTime);
            setStartSelection({
                date: startDate,
                hour: startDate.getHours()
            });
        }
        if (profileVector.endTime) {
            const endDate = new Date(profileVector.endTime);
            setEndSelection({
                date: endDate,
                hour: endDate.getHours()
            });
        }
    }, [profileVector]);

    const isTimeAvailabilityReady =
        startSelection?.date &&
        startSelection?.hour !== null &&
        endSelection?.date &&
        endSelection?.hour !== null;

    const sendMessage = async () => {
        if (!inputText.trim()) return;

        const userMessage = {
            id: Date.now().toString(),
            text: inputText.trim(),
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        const messageToSend = inputText.trim();
        setInputText('');
        setIsTyping(true);

        try {
            const userId = user.id || user.email || 'visitor';
            const currentLang = i18n.language || 'it';

            const response = await fetch('http://localhost:5203/api/chatbot/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userId.toString(),
                    municipality: selectedCity,
                    language: currentLang,
                    message: messageToSend,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            const botResponse = {
                id: (Date.now() + 1).toString(),
                text: data.response || "Ecco i miei suggerimenti culturali per te.",
                sender: 'bot',
                timestamp: new Date(data.responseDate) || new Date(),
            };

            setMessages((prev) => [...prev, botResponse]);
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage = {
                id: (Date.now() + 1).toString(),
                text: t('chatbot.errorSending', 'Si è verificato un errore di connessione. Riprova tra poco.'),
                sender: 'bot',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
            toast.error(t('chatbot.errorSending', 'Errore durante l\'invio del messaggio'));
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="min-h-5 p-4 md:p-8 flex items-center justify-center">
            <div className="w-full max-w-4xl h-[calc(100vh-8rem)] flex flex-col">

                {/* Header */}
                <div className="bg-white dark:bg-gray-900 rounded-t-3xl shadow-lg p-6 border-b border-gray-100 dark:border-gray-800">
                    <button
                        onClick={onBack}
                        className={`inline-flex items-center gap-2 font-bold text-xs transition-colors mb-4 ${themeText}`}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>{t('carousel_back_dashboard', 'Torna alla Dashboard')}</span>
                    </button>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="text-2xl font-black text-gray-900 dark:text-white">{t('dashboard_card3_title', 'Assistente Chatbot')}</h1>
                                <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border shadow-2xs ${themeBadgeClass}`}>
                                    {isIt ? "ESN Camerino 🇮🇹" : "ESN Olten 🇨🇭"}
                                </span>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 text-xs">
                                {t('chatbot.subtitle', 'Fammi domande su punti d\'interesse, eventi e consigli')} a {selectedCity}
                            </p>
                        </div>

                        {!loading && (
                            <div className="flex flex-wrap items-center gap-2">
                                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${themeBadgeClass}`}>
                                    <MapPin className={`w-3.5 h-3.5 ${themeHighlight}`} />
                                    <span>{selectedCity} ({isIt ? "IT" : "CH"})</span>
                                </div>
                                {isTimeAvailabilityReady && (
                                    <div className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${themeBadgeClass}`}>
                                        <Sparkles className={`w-3.5 h-3.5 ${themeHighlight}`} />
                                        <span>Periodo Configurato</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Messages Container */}
                <div className="flex-1 bg-gray-50/70 dark:bg-gray-950/70 overflow-y-auto p-6 space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex gap-3 max-w-[85%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                {/* Avatar */}
                                <div
                                    className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                                        message.sender === 'user'
                                            ? themeUserBubble
                                            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200'
                                    }`}
                                >
                                    {message.sender === 'user' ? (
                                        <UserIcon className="w-4 h-4" />
                                    ) : (
                                        <Bot className={`w-4 h-4 ${themeHighlight}`} />
                                    )}
                                </div>

                                {/* Message Bubble */}
                                <div>
                                    <div
                                        className={`rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm ${
                                            message.sender === 'user'
                                                ? `${themeUserBubble} rounded-tr-none font-medium`
                                                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-100 dark:border-gray-700/80 whitespace-pre-wrap'
                                        }`}
                                    >
                                        <p>{message.text}</p>
                                    </div>
                                    <p className={`text-[10px] text-gray-400 mt-1 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Typing Indicator */}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="flex gap-3 max-w-[85%]">
                                <div className="w-9 h-9 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                                    <Bot className={`w-4 h-4 ${themeHighlight}`} />
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 dark:border-gray-700 px-5 py-4">
                                    <div className="flex gap-1.5 items-center">
                                        <div className={`w-2 h-2 rounded-full animate-bounce ${isIt ? 'bg-emerald-600' : 'bg-red-700'}`} style={{ animationDelay: '0ms' }} />
                                        <div className={`w-2 h-2 rounded-full animate-bounce ${isIt ? 'bg-emerald-600' : 'bg-red-700'}`} style={{ animationDelay: '150ms' }} />
                                        <div className={`w-2 h-2 rounded-full animate-bounce ${isIt ? 'bg-emerald-600' : 'bg-red-700'}`} style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Container */}
                <div className="bg-white dark:bg-gray-900 rounded-b-3xl shadow-xl p-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex gap-3 items-end">
                        <div className="flex-1 relative">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={t('chatbot.typePlaceholder', 'Scrivi una domanda sulla tua destinazione...')}
                                disabled={isTyping}
                                className={`w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl text-sm font-medium ${themeFocusBorder} focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed`}
                            />
                        </div>

                        <button
                            type="button"
                            onClick={sendMessage}
                            disabled={isTyping || !inputText.trim()}
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${themeBgBtn}`}
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Chatbot;