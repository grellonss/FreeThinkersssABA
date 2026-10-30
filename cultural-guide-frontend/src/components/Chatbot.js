import React, {useState, useRef, useEffect} from 'react';
import {Send, ArrowLeft, MapPin, User as UserIcon} from 'lucide-react';
import {toast} from 'sonner';
import {useTranslation} from "react-i18next";
import {formatDate} from "../utils/formatDate";
import {LoadingSpinner} from "./ui_components/Loading";


export function Chatbot({user, onBack}) {
    const {t, i18n} = useTranslation();
    const [messages, setMessages] = useState([
        {
            id: '1',
            text: `Hello ${user.name}! How can I help you today?`,
            sender: 'bot',
            timestamp: new Date(),
        },
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // City selection state
    const [selectedCity, setSelectedCity] = useState("");

    // Time availability state
    const [startSelection, setStartSelection] = useState({date: null, hour: null});
    const [endSelection, setEndSelection] = useState({date: null, hour: null});

    // Preference state
    const [hasProfileVector, setHasProfileVector] = useState(null);
    const [profileVector, setProfileVector] = useState(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
    }, [messages, isTyping]);

    // -----------------------------
    // Check if user has preferences (profile vector) stored
    // -----------------------------
    useEffect(() => {
        if (!user) {
            setHasProfileVector(false);
            return;
        }

        const checkUserProfileVector = async () => {
            setLoading(true);
            setError("");

            try {
                const userId = user.id || user.email;

                const response = await fetch(
                    `http://localhost:5203/api/eppoiapi/profile-vector/${encodeURIComponent(userId)}`,
                    {
                        method: "GET",
                        headers: {"Content-Type": "application/json"},
                        credentials: "include",
                    }
                );

                if (response.ok) {
                    const profileVector = await response.json();
                    setProfileVector(profileVector);
                    setHasProfileVector(true);

                    console.log("User preferences found:", profileVector);
                } else if (response.status === 404) {
                    // No preferences found yet for this user
                    setHasProfileVector(false);
                } else {
                    throw new Error(`HTTP ${response.status}`);
                }
            } catch (err) {
                toast.error("Error checking preferences:", err);
                setError("Failed to check user profile vector.");
                setHasProfileVector(false);
            } finally {
                setLoading(false);
            }
        };

        checkUserProfileVector();
    }, [user]);

    // -----------------
    // Extract city and time availability from profile vector
    // -----------------
    useEffect(() => {
        if (!profileVector) {
            return;
        }

        // City
        if (profileVector.municipality) {
            setSelectedCity(profileVector.municipality);
        }

        // Time Availability - Parse ISO strings to { date, hour } format
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

    }, [profileVector]); // Add profileVector as dependency

    // -----------------------------
    // wait for timeAvailability from ProfileVector Database fetch is ready
    // -----------------------------
    const isTimeAvailabilityReady =
        startSelection?.date &&
        startSelection?.hour !== null &&
        startSelection?.hour !== undefined &&
        endSelection?.date &&
        endSelection?.hour !== null &&
        endSelection?.hour !== undefined;

    const sendMessage = async () => {
        if (!inputText.trim()) {
            toast.error(t('chatbot.errorEmpty'));
            return;
        }

        const userMessage = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'user',
            timestamp: new Date(),
            language: i18n.language,
        };

        setMessages((prev) => [...prev, userMessage]);
        const messageToSend = inputText;
        setInputText('');
        setIsTyping(true);

        try {
            const response = await fetch('http://localhost:5203/api/chatbot/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    // check in backend if user has valid token/session
                    userId: user.id || user.email,
                    municipality: selectedCity,
                    message: messageToSend,
                    messageSentDate: new Date().toISOString(),
                    language: i18n.language,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                const botMessage = {
                    id: (Date.now() + 1).toString(),
                    text: data.response || data.message,
                    sender: 'bot',
                    timestamp: new Date(),
                };

                setMessages((prev) => [...prev, botMessage]);
            } else {
                throw new Error(data.error || 'Unknown error');
            }
        } catch (error) {
            console.error('Error sending message:', error);

            const errorMessage = {
                id: (Date.now() + 1).toString(),
                text: t('chatbot.errorResponse') || 'Sorry, I encountered an error. Please try again.',
                sender: 'bot',
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, errorMessage]);
            toast.error(t('chatbot.errorSending'));
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
                <div className="bg-white rounded-t-2xl shadow-xl p-6">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-5 h-5"/>
                        <span>{t('chatbot.goBack')}</span>
                    </button>

                    <div className="flex items-center justify-between">
                        {/* Loading State */}
                        {loading && (
                            <div className="flex justify-center py-20">
                                <LoadingSpinner size="lg"/>
                            </div>
                        )}
                        <div>
                            <h1 className="text-gray-900 mb-2">{t('chatbot.title')}</h1>
                            <p className="text-gray-600">{t('chatbot.subtitle')}</p>
                        </div>
                        {!loading && (
                            <div className="flex flex-col gap-2 items-end">
                                <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-lg">
                                    <MapPin className="w-4 h-4 text-indigo-600"/>
                                    <span className="text-indigo-900 text-sm">{selectedCity}</span>
                                </div>
                                <br/>
                                <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-lg">
                                    {isTimeAvailabilityReady && t("interestSelection_timeAvailability", {
                                        startDate: formatDate(startSelection.date, formatDate.locale),
                                        startHour: `${startSelection.hour.toString().padStart(2, '0')}:00 → `,
                                        endDate: formatDate(endSelection, formatDate.locale),
                                        endHour: `${endSelection.hour.toString().padStart(2, '0')}:00`
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Messages Container */}
                <div className="flex-1 bg-gray-50 overflow-y-auto p-6 space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`flex gap-3 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                {/* Avatar */}
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                        message.sender === 'user'
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-300 text-gray-700'
                                    }`}
                                >
                                    {message.sender === 'user' ? (
                                        <UserIcon className="w-5 h-5"/>
                                    ) : (
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path
                                                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                                        </svg>
                                    )}
                                </div>

                                {/* Message Bubble */}
                                <div>
                                    <div
                                        className={`rounded-2xl px-4 py-3 ${
                                            message.sender === 'user'
                                                ? 'bg-indigo-600 text-white rounded-tr-none'
                                                : 'bg-white text-gray-900 rounded-tl-none shadow-md'
                                        }`}
                                    >
                                        <p className="break-words">{message.text}</p>
                                    </div>
                                    <p className={`text-xs text-gray-500 mt-1 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                                        {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Typing Indicator */}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="flex gap-3 max-w-[80%]">
                                {/* Bot Avatar */}
                                <div
                                    className="w-10 h-10 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path
                                            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                                    </svg>
                                </div>

                                {/* Typing Bubble */}
                                <div className="bg-white rounded-2xl rounded-tl-none shadow-md px-5 py-4">
                                    <div className="flex gap-1.5">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                             style={{animationDelay: '0ms'}}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                             style={{animationDelay: '150ms'}}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                             style={{animationDelay: '300ms'}}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef}/>
                </div>

                {/* Input Container */}
                <div className="bg-white rounded-b-2xl shadow-xl p-4">
                    <div className="flex gap-3 items-end">
                        <div className="flex-1 relative">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={t('chatbot.typePlaceholder')}
                                disabled={isTyping}
                                className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-indigo-600 focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>

                        <button
                            onClick={sendMessage}
                            disabled={isTyping || !inputText.trim()}
                            className="w-12 h-12 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0 hover:scale-105 active:scale-95"
                        >
                            <Send className="w-5 h-5"/>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}