import { useEffect, useState } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

const ffmpeg = new FFmpeg({ log: true });

export default function Converter() {
  const [gifUrl, setGifUrl] = useState(null);
  const [Video, setVideo] = useState(null);
  const [Converting, setConverting] = useState(false)
  useEffect(() => {
    async function loadFFmpeg() {
      await ffmpeg.load();
      console.log('ffmpegLoaded');
    }
    loadFFmpeg();
  }, []);

  async function ConvertFile() {
    if (!Video) {
      alert('Please upload a video first');
      return;
    }

    try {
      const videoData = await fetchFile(Video); // Convert file object to buffer
      await ffmpeg.writeFile('video.mp4', videoData); // Save file as video.mp4 in FFmpeg system
      setConverting(true)
      await ffmpeg.exec([
        '-i',
        'video.mp4',
        '-vf',
        'fps=30,scale=100:-1:flags=lanczos',
        'output.gif',
      ]);

      const gifData = await ffmpeg.readFile('output.gif'); // Read the generated GIF file
      const gifBlob = new Blob([gifData.buffer], { type: 'image/gif' });
      const gifObjectUrl = URL.createObjectURL(gifBlob);
      setConverting(false)
      setGifUrl(gifObjectUrl); // Set URL for displaying the GIF
    } catch (error) {
      console.error('Error during file conversion:', error);
    }
  }

  function handleFileChange(event) {
    setVideo(event.target.files[0]);
  }

  return (
    <div className="Container">
      <div className="Converter">
        <h1>
          <span>Video To Gif</span>
          <br />
          <span>Converter</span>
        </h1>

        <div>
          <input type="file" onChange={handleFileChange} />
          <button onClick={ConvertFile}>Convert</button>
        </div>

        <br />
        {Converting? "Converting File please wait.." :
        (gifUrl && <img src={gifUrl} alt="Converted GIF" />)
        }
      </div>
    </div>
  );
}
