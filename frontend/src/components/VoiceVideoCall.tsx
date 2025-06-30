import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Video, VideoOff, Phone, PhoneOff, Volume2, VolumeX } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useTheme } from '../contexts/ThemeContext';
import UpgradePrompt from './UpgradePrompt';
import toast from 'react-hot-toast';

interface VoiceVideoCallProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'voice' | 'video';
    sessionId: string;
}

const VoiceVideoCall: React.FC<VoiceVideoCallProps> = ({ isOpen, onClose, mode, sessionId }) => {
    const { canAccessFeature } = useSubscription();
    const { isDark } = useTheme();
    const [isConnected, setIsConnected] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoEnabled, setIsVideoEnabled] = useState(mode === 'video');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [showUpgrade, setShowUpgrade] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);

    const audioRef = useRef<HTMLAudioElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        if (isOpen) {
            // Check if user can access the feature
            const hasAccess = canAccessFeature(mode);
            if (!hasAccess) {
                setShowUpgrade(true);
                return;
            }

            initializeCall();
        }

        return () => {
            cleanup();
        };
    }, [isOpen, mode]);

    const initializeCall = async () => {
        try {
            // Get user media
            const constraints = {
                audio: true,
                video: mode === 'video'
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;

            if (mode === 'video' && videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            // Set up media recorder for voice input
            mediaRecorderRef.current = new MediaRecorder(stream);

            setIsConnected(true);
            toast.success(`${mode === 'video' ? 'Video' : 'Voice'} call started`);
        } catch (error) {
            console.error('Failed to initialize call:', error);
            toast.error('Failed to access camera/microphone');
        }
    };

    const cleanup = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
        }
        setIsConnected(false);
    };

    const generateVoiceResponse = async (text: string) => {
        try {
            const response = await fetch('/api/voice/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    text,
                    voiceId: 'default', // Use a default voice or user preference
                })
            });

            const data = await response.json();
            if (data.success) {
                setAudioUrl(data.data.audio);
                if (audioRef.current) {
                    audioRef.current.src = data.data.audio;
                    audioRef.current.play();
                }
            }
        } catch (error) {
            console.error('Voice generation failed:', error);
            toast.error('Failed to generate voice response');
        }
    };

    const generateVideoResponse = async (text: string) => {
        try {
            const response = await fetch('/api/video/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    script: text,
                    replicaId: 'default', // Use a default replica or user preference
                })
            });

            const data = await response.json();
            if (data.success) {
                // Poll for video completion
                pollVideoStatus(data.data.videoId);
            }
        } catch (error) {
            console.error('Video generation failed:', error);
            toast.error('Failed to generate video response');
        }
    };

    const pollVideoStatus = async (videoId: string) => {
        const checkStatus = async () => {
            try {
                const response = await fetch(`/api/video/status/${videoId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                const data = await response.json();
                if (data.success) {
                    if (data.data.status === 'completed' && data.data.downloadUrl) {
                        setVideoUrl(data.data.downloadUrl);
                        if (videoRef.current) {
                            videoRef.current.src = data.data.downloadUrl;
                            videoRef.current.play();
                        }
                    } else if (data.data.status === 'processing') {
                        // Continue polling
                        setTimeout(checkStatus, 2000);
                    }
                }
            } catch (error) {
                console.error('Failed to check video status:', error);
            }
        };

        checkStatus();
    };

    const toggleMute = () => {
        if (streamRef.current) {
            const audioTrack = streamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    };

    const toggleVideo = () => {
        if (streamRef.current) {
            const videoTrack = streamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoEnabled(videoTrack.enabled);
            }
        }
    };

    const endCall = () => {
        cleanup();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
            >
                <div className="w-full h-full flex flex-col">
                    {/* Video Area */}
                    <div className="flex-1 relative">
                        {mode === 'video' && (
                            <>
                                {/* User Video */}
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    muted
                                    className="absolute top-4 right-4 w-48 h-32 rounded-lg border-2 border-white/20 object-cover z-10"
                                />

                                {/* AI Video Response */}
                                {videoUrl && (
                                    <video
                                        src={videoUrl}
                                        autoPlay
                                        className="w-full h-full object-cover"
                                    />
                                )}
                            </>
                        )}

                        {mode === 'voice' && (
                            <div className="flex items-center justify-center h-full">
                                <motion.div
                                    animate={{
                                        scale: isSpeaking ? [1, 1.2, 1] : 1,
                                        opacity: isSpeaking ? [0.8, 1, 0.8] : 0.8
                                    }}
                                    transition={{ duration: 1, repeat: isSpeaking ? Infinity : 0 }}
                                    className="w-64 h-64 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center"
                                >
                                    <Volume2 className="w-24 h-24 text-white" />
                                </motion.div>
                            </div>
                        )}

                        {/* Connection Status */}
                        <div className="absolute top-4 left-4">
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${isConnected
                                    ? 'bg-green-500 text-white'
                                    : 'bg-red-500 text-white'
                                }`}>
                                {isConnected ? 'Connected' : 'Connecting...'}
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="p-6 flex justify-center space-x-4">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={toggleMute}
                            className={`p-4 rounded-full ${isMuted ? 'bg-red-500' : 'bg-gray-700'
                                } text-white hover:bg-opacity-80 transition-colors`}
                        >
                            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                        </motion.button>

                        {mode === 'video' && (
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={toggleVideo}
                                className={`p-4 rounded-full ${isVideoEnabled ? 'bg-gray-700' : 'bg-red-500'
                                    } text-white hover:bg-opacity-80 transition-colors`}
                            >
                                {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                            </motion.button>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={endCall}
                            className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                        >
                            <PhoneOff className="w-6 h-6" />
                        </motion.button>
                    </div>
                </div>

                {/* Hidden audio element for voice responses */}
                <audio
                    ref={audioRef}
                    onPlay={() => setIsSpeaking(true)}
                    onEnded={() => setIsSpeaking(false)}
                    className="hidden"
                />
            </motion.div>

            <UpgradePrompt
                isOpen={showUpgrade}
                onClose={() => setShowUpgrade(false)}
                feature={mode}
            />
        </>
    );
};

export default VoiceVideoCall;
