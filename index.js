const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = 8000;

// Middleware
// const allowedOrigins = [
//   'https://musique-player-ropdxm-ropdxms-projects.vercel.app',
//   'http://localhost:3000' // For local development
// ];

// app.use(cors({
//   origin: function (origin, callback) {
//     // Allow requests with no origin (like mobile apps or curl requests)
//     if (!origin) return callback(null, true);
    
//     callback(null, true);    
//   },
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true,
//   preflightContinue: true
// }));
app.use(cors());
// Handle preflight requests
// router.options('/', async (req, res) => {

//   res.set("Access-Control-Allow-Origin", "*");
//   res.set("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
//   res.set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization, authorizationToken");

//   return res.status(OK);
// });


app.use(bodyParser.json());

// app.use(function (req, res, next) {

//     // Website you wish to allow to connect
//     res.setHeader('Access-Control-Allow-Origin', 'https://musique-player-ropdxm-ropdxms-projects.vercel.app/');

//     // Request methods you wish to allow
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

//     // Request headers you wish to allow
//   res.header(
//     'Access-Control-Allow-Headers',
//     'Origin, X-Requested-With, Content-Type, Accept'
//   );

//     // Set to true if you need the website to include cookies in the requests sent
//     // to the API (e.g. in case you use sessions)
//     res.setHeader('Access-Control-Allow-Credentials', true);

//     // Pass to next layer of middleware
//     next();
// });



const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = '';
    if (file.mimetype === 'audio/mpeg') {
      uploadPath = 'data/mp3';
    } else if (file.mimetype.startsWith('image/')) {
      uploadPath = 'data/cover';
    } else {
      return cb(new Error('Invalid file type'));
    }
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Keep original filename but sanitize it
    const sanitizedName = file.originalname.replace(/[^a-z0-9.-]/gi, '_').toLowerCase();
    cb(null, sanitizedName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB limit for audio files
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'audio/mpeg' || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only MP3 and image files are allowed'), false);
    }
  }
});

// Serve static files from your data folders
app.use('/mp3', express.static(path.join(__dirname, 'data/mp3')));
app.use('/cover', express.static(path.join(__dirname, 'data/cover')));

// Sample initial data
const songs = [
    { id: 0 , name:"HOLT - HAND IN GLOVE" , url: "/mp3/HOLT - HAND IN GLOVE - single from EP 'Heavy Water'.mp3" , cover:"/cover/2.jpeg" , duration : "3:43"},
    {  id: 1 , name:"Not Like Us" , url: "/mp3/Not Like Us.mp3",cover:"/cover/1.jpg" ,duration : "4:33"},
    {  id: 2 ,name:"Una Noche en Cali" , url: "/mp3/Una Noche en Cali.mp3",cover:"/cover/3.jpeg" ,duration : "2:40" },
    {  id: 3  ,name:"Hitha Addara Lagata Wela" , url: "/mp3/Hitha Addara Lagata Wela.mp3",cover:"/cover/4.jpeg" , duration : "4:04"},
    {  id: 4 ,name:"Bisawa" , url: "/mp3/bisawa.mp3",cover:"/cover/bisawa.jpeg",duration : "3:21"},
    {  id: 5 ,name:"Amathaka katanna Epa" , url: "/mp3/Amathaka karanna epa.mp3",cover:"/cover/amathaka.jpeg" ,duration : "4:23"},
    {  id: 6 ,name:"Kadu atharin ude hawa" , url: "/mp3/kadu atharin.mp3",cover:"/cover/Kadu atharin ude hawa.jpeg" ,duration : "4:09"},
    {  id: 7 ,name:"KALU - As Thol Lema" , url: "/mp3/KALU - As Thol Lema.mp3",cover:"/cover/astholame.jpeg" ,duration : "4:09"},
    {  id: 8 ,name:"Work from Home" , url: "/mp3/Fifth Harmony - Work from Home (Official Video) ft. Ty Dolla $ign.mp3",cover:"/cover/maxresdefault.jpg" ,duration : "3:39"},
    {  id: 9 ,name:"Rockabye Clean Bandit" , url: "/mp3/Clean Bandit - 'Rockabye' feat. Anne-Marie and Sean Paul (Live At Capital's Summertime Ball).mp3",cover:"/cover/R-10100735-1491618927-2207.jpg" ,duration : "4:36"},
    {  id: 10 ,name:"Don Omar - Danza Kuduro" , url: "/mp3/Don Omar - Danza Kuduro REMIX.mp3",cover:"/cover/11.jpg" ,duration : "7:50"},
    {  id: 11 ,name:"Redfoo - New Thang" , url: "/mp3/ Redfoo - New Thang (Official Video).mp3",cover:"/cover/12.jpg" ,duration : "4:01"},
]

let favorites = [1];


// Helper function to encode file to base64
const encodeFileToBase64 = (filePath) => {
    try {
        const absolutePath = path.join(__dirname, filePath);
        const fileData = fs.readFileSync(absolutePath);
        const mimeType = getMimeType(filePath);
        return `data:${mimeType};base64,${fileData.toString('base64')}`;
    } catch (err) {
        console.error(`Error encoding file ${filePath}:`, err);
        return null;
    }
};
// Helper to get MIME type from file extension
const getMimeType = (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
        case '.mp3': return 'audio/mpeg';
        case '.jpg': return 'image/jpeg';
        case '.jpeg': return 'image/jpeg';
        case '.png': return 'image/png';
        default: return 'application/octet-stream';
    }
};

// API endpoint to get songs with encoded data
app.get('/', async (req, res) => {
    try {
        const withEncodedData = req.query.encoded === 'true';
        
        const songsResponse = await Promise.all(songs.map(async song => {
            if (!withEncodedData) {
                return {
                    id: song.id,
                    name: song.name,
                    url: song.url,
                    cover: song.cover,
                    duration: song.duration
                };
            }

            const audioData = encodeFileToBase64(song.url);
            const coverData = encodeFileToBase64(song.cover);
            console.log(song.url)
            return {
                id: song.id,
                name: song.name,
                audioData: audioData || song.url,
                coverData: coverData || song.cover,
                duration: song.duration,
                // Keep original URLs as fallback
                url: song.url,
                cover: song.cover
            };
        }));

        res.json(songsResponse);
    } catch (err) {
        console.error('Error processing songs:', err);
        res.status(500).json({ error: 'Failed to process songs' });
    }
});

app.get("/a", (req, res) => {
    res.send("hello yopta");
});
// Get a specific song by ID
app.get('/api/songs/:id', (req, res) => {
    const song = songs.find(s => s.id === parseInt(req.params.id));
    if (!song) return res.status(404).send('Song not found');
    res.json(song);
});

// Get all favorite songs
app.get('/favorites', (req, res) => {
    res.json(favorites);
});

// Add to favorites
app.post('/favorites', (req, res) => {
  const { songId } = req.body;
  const song = songs.find(s => s.id === songId);
  
  if (!song) {
    return res.status(404).json({ error: 'Song not found' });
  }
  
  if (!favorites.includes(songId)) {
    favorites.push(songId);
  }
  
  res.json(favorites);
});

// Remove a song from favorites
app.delete('/favorites/:songId', (req, res) => {
  const songId = Number(req.params.songId);
  favorites = favorites.filter(id => id !== songId);
  res.json(favorites);
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;