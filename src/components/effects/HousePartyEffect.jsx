import React, { useState, useEffect, useMemo } from 'react';

const HousePartyEffect = ({ onComplete }) => {
    const [audio] = useState(new Audio('https://cdn.pixabay.com/audio/2022/08/04/audio_3fa24419b1.mp3'));

    useEffect(() => {
        // Play audio
        audio.volume = 0.5;
        audio.play();

        // Set a timer to stop the effect
        const timer = setTimeout(() => {
            audio.pause();
            audio.currentTime = 0;
            onComplete();
        }, 8000);

        // Cleanup on unmount
        return () => {
            clearTimeout(timer);
            audio.pause();
            audio.currentTime = 0;
        };
    }, [onComplete, audio]);

    const confettiPieces = useMemo(() => {
        const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800'];
        return Array.from({ length: 150 }).map((_, i) => ({
            id: i,
            color: colors[Math.floor(Math.random() * colors.length)],
            left: `${Math.random() * 100}%`,
            top: `${-20 - Math.random() * 80}%`, // Start above the screen
            animationDuration: `${5 + Math.random() * 5}s`,
            animationDelay: `${Math.random() * 2}s`,
            transform: `rotate(${Math.random() * 360}deg)`
        }));
    }, []);

    return (
        <div 
            className="fixed inset-0 w-full h-full z-[9999] overflow-hidden pointer-events-none"
        >
             <style>
                {`
                    @keyframes party-background {
                        0% { background-color: rgba(255, 192, 203, 0.1); }
                        25% { background-color: rgba(173, 216, 230, 0.1); }
                        50% { background-color: rgba(144, 238, 144, 0.1); }
                        75% { background-color: rgba(255, 255, 153, 0.1); }
                        100% { background-color: rgba(255, 192, 203, 0.1); }
                    }

                    @keyframes fall {
                        to {
                            transform: translateY(100vh) rotate(720deg);
                            opacity: 0;
                        }
                    }

                    .party-overlay {
                        animation: party-background 2s infinite;
                    }

                    .confetti {
                        position: absolute;
                        width: 10px;
                        height: 10px;
                        opacity: 1;
                        animation: fall linear forwards;
                    }
                `}
            </style>
            <div className="absolute inset-0 party-overlay"></div>
            {confettiPieces.map(piece => (
                <div
                    key={piece.id}
                    className="confetti"
                    style={{
                        backgroundColor: piece.color,
                        left: piece.left,
                        top: piece.top,
                        animationDuration: piece.animationDuration,
                        animationDelay: piece.animationDelay,
                        transform: piece.transform,
                    }}
                />
            ))}
        </div>
    );
};

export default HousePartyEffect;