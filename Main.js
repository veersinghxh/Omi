<!DOCTYPE html>
<html lang="hi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Omegle Clone - PeerJS & Socket.io</title>
    <style>
        body { background:#111; color:white; text-align:center; font-family:Arial; margin:0; padding:20px; }
        .video-wrapper { display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; }
        video { width:320px; height:240px; border:2px solid #444; border-radius:10px; background: #000; object-fit:cover; }
        .controls { margin-top: 20px; }
        button { padding:12px 24px; font-size: 16px; cursor: pointer; background: #28a745; color: white; border: none; border-radius: 5px; }
        #status { color: #ffc107; margin: 15px; font-weight: bold; }
    </style>
</head>
<body>

    <h3>📱 Real-time Random Video Chat</h3>
    <p id="status">कैमरा शुरू करें...</p>

    <div class="video-wrapper">
        <video id="localVideo" autoplay muted playsinline></video>
        <video id="remoteVideo" autoplay playsinline></video>
    </div>

    <div class="controls">
        <button id="startBtn" onclick="init()">Start/Next Stranger</button>
    </div>

    <script src="https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js"></script>
    <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>

    <script>
        let peer;
        let localStream;
        let socket;
        const statusEl = document.getElementById("status");
        const remoteVideo = document.getElementById("remoteVideo");
        const localVideo = document.getElementById("localVideo");

        // 1. कैमरा एक्सेस और कनेक्शन सेटअप
        async function init() {
            if (!localStream) {
                try {
                    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                    localVideo.srcObject = localStream;
                    statusEl.innerText = "सर्वर से जुड़ रहे हैं...";
                    connectToServer();
                } catch (err) {
                    statusEl.innerText = "कैमरा एक्सेस नहीं मिला!";
                    console.error(err);
                }
            } else {
                findNewPartner();
            }
        }

        function connectToServer() {
            // Socket connection (Replace with your server URL)
            socket = io('http://localhost:8000');

            // PeerJS connection
            peer = new Peer();

            peer.on("open", (myPeerId) => {
                console.log("My ID:", myPeerId);
                // सर्वर को अपनी PeerID भेजें ताकि वो मैचिंग कर सके
                socket.emit('start', myPeerId);
                statusEl.innerText = "किसी अजनबी की तलाश है...";
            });

            // कॉल आने पर जवाब देना
            peer.on("call", (call) => {
                call.answer(localStream);
                call.on("stream", (stream) => {
                    remoteVideo.srcObject = stream;
                    statusEl.innerText = "जुड़ गए!";
                });
            });

            // जब सर्वर किसी अजनबी की ID भेजे (Matchmaking)
            socket.on('remote-socket', (remotePeerId) => {
                statusEl.innerText = "अजनबी मिल गया! कनेक्ट कर रहे हैं...";
                makeCall(remotePeerId);
            });
        }

        // 2. कॉल करने का फंक्शन
        function makeCall(remoteId) {
            const call = peer.call(remoteId, localStream);
            call.on("stream", (stream) => {
                remoteVideo.srcObject = stream;
                statusEl.innerText = "जुड़ गए!";
            });
        }

        // 3. अगला अजनबी ढूंढना (Skip/Next)
        function findNewPartner() {
            remoteVideo.srcObject = null;
            statusEl.innerText = "नया अजनबी ढूंढ रहे हैं...";
            socket.emit('start', peer.id); 
        }
    </script>
</body>
</html>
                
