"use client";
import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { connect, createLocalTracks } from "twilio-video";
import axios from "axios";
import "bootstrap-icons/font/bootstrap-icons.css"; // Import bootstrap-icons

export default function Home() {
    const [identity, setIdentity] = useState("User");
    const [roomName, setRoomName] = useState("");
    const [room, setRoom] = useState(null);
    const [localTracks, setLocalTracks] = useState({ videoTrack: null, audioTrack: null });
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        return () => {
            if (room) {
                room.disconnect();
            }
            if (localTracks.videoTrack) {
                localTracks.videoTrack.stop();
            }
            if (localTracks.audioTrack) {
                localTracks.audioTrack.stop();
            }
        };
    }, [room, localTracks]);

    const handleJoinRoom = async () => {
        try {
            const tokenResponse = await axios.get(`http://localhost:5000/token?identity=${identity}`);
            const { token } = tokenResponse.data;

            const newRoom = await connect(token, {
                name: roomName,
                tracks: [],
            });

            setRoom(newRoom);
            newRoom.on("participantConnected", (participant) => {
                console.log(`A remote Participant connected: ${participant.identity}`);
            });

            const tracks = await createLocalTracks({ video: true, audio: true });
            const videoTrack = tracks.find((track) => track.kind === "video");
            const audioTrack = tracks.find((track) => track.kind === "audio");
            setLocalTracks({ videoTrack, audioTrack });

            const videoContainer = document.getElementById("localVideo");
            if (videoTrack) {
                videoContainer.appendChild(videoTrack.attach());
            }
        } catch (error) {
            console.error("Error joining room:", error);
        }
    };

    const handleLeaveRoom = () => {
        if (room) {
            room.disconnect();

            if (localTracks.videoTrack) {
                localTracks.videoTrack.stop();
            }
            if (localTracks.audioTrack) {
                localTracks.audioTrack.stop();
            }

            setLocalTracks({ videoTrack: null, audioTrack: null });
            setRoom(null);
        }
    };

    const handleToggleMute = () => {
        const { audioTrack } = localTracks;
        
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled; // Toggle the enabled state
            setIsMuted(!audioTrack.enabled); // Set isMuted based on the track's enabled state
        }
    };

    return (
        <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
            <h1>Video Chat Application</h1>
            <input
                type="text"
                placeholder="Enter Room Name"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                style={{ marginRight: "10px", padding: "5px", width: "200px" }}
            />
            <input
                type="text"
                placeholder="Enter Your Identity"
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
                style={{ marginRight: "10px", padding: "5px", width: "200px" }}
            />
            <Button onClick={handleJoinRoom} disabled={!roomName || !identity} style={{ marginRight: "10px" }}>
                Join Room
            </Button>
            <Button onClick={handleLeaveRoom} disabled={!room}>
                Leave Room
            </Button>
            <div id="localVideo" style={{ marginTop: "20px", border: "1px solid #ccc", padding: "10px", width: "300px", height: "200px" }}></div>
            <Button 
                onClick={handleToggleMute} 
                style={{ 
                    marginTop: "10px", 
                    padding: "10px", 
                    borderRadius: "50%", 
                    backgroundColor: isMuted ? "#dc3545" : "#198754", 
                    color: "white",
                    fontSize: "1.5rem"
                }}
            >
                {isMuted ? (
                    <i className="bi bi-mic-mute-fill"></i>
                ) : (
                    <i className="bi bi-mic-fill"></i>
                )}
            </Button>
        </div>
    );
}
