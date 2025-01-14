import { useEffect, useState } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

const ffmpeg = new FFmpeg({ log: true });

export default function Converter() {
  const [gifUrl, setGifUrl] = useState(null);
  const [Video , setVideo] = useState()

  useEffect(() => {
    async function loadFFmpeg(){
      await ffmpeg.load()
      console.log("ffmpegLoaded")
    }
    loadFFmpeg();
  },[])
   
  async function ConvertFile() {
    const videoData = await fetchFile(Video); // Przekształć obiekt File w bufor
    await ffmpeg.writeFile('video.mp4', videoData); // Zapisz plik jako video.mp4 w systemie FFmpeg
    await ffmpeg.exec([
        '-i', 'video.mp4',
        '-vf', 'fps=30,scale=100:-1:flags=lanczos',
        'output.gif',
    ]);

    const gifData = await ffmpeg.readFile('output.gif'); // Odczytaj wygenerowany plik GIF
    const gifBlob = new Blob([gifData.buffer], { type: 'image/gif' });
    const gifObjectUrl = URL.createObjectURL(gifBlob);
    setGifUrl(gifObjectUrl); // Ustaw URL dla wyświetlenia GIF-a
}


    function handleFileChange(event) {
        setVideo(event.target.files[0]);
    }

  return (
    <>
    <div className='Container'>
        <div className='Converter'>
            <h1><span>Video To Gif</span><br></br><span>Converter</span></h1>

            <div>
            <input type="file" onChange={handleFileChange}></input>
            <button onClick={()=>ConvertFile()}>Convert</button>
           
            </div>

            {Video ? <video><source src={URL.createObjectURL(Video)} type='video/mp4'></source></video> : ""}
            <img src={gifUrl}></img>

      </div>
    </div>
    </>
  );
}

