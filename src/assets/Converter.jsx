import { useEffect, useState } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { motion,AnimatePresence, progress } from 'framer-motion';

const ffmpeg = new FFmpeg({ log: true });

export default function Converter() {
  const [gifUrl, setGifUrl] = useState(null);
  const [Placeholder, setPlaceholder] = useState("Upload file")
  const [Video, setVideo] = useState(null);
  const [Converting, setConverting] = useState(false)
  const [Size, setSize] = useState(100)
  const [FramesPS, setFramesPS] = useState(30)
  const [SettingsMenu,setSettingsMenu] = useState(false)
  const [Text , setText] = useState("")
  const [ConvertingProgress, setConvertingProgress] = useState({
    time: 0,
    progress: 0,
  })

  useEffect(() => {
    async function loadFFmpeg() {
      

      await ffmpeg.load();
      console.log('ffmpegLoaded');
    }
    loadFFmpeg();
  }, []);


  
  async function ConvertFile() {
    if (!Video || Converting) {
      if(Converting){return}
      else{
      return;}
    }

    try {
      ffmpeg.on('progress', ({ progress, time }) => {
        if(progress > 105 || progress < 0.01){setConvertingProgress({time:0 ,progress:5})} else {setConvertingProgress({time: (time / 1000000) ,progress:(progress * 100).toFixed(0)})}
    });

      const videoData = await fetchFile(Video); // Convert file object to buffer
      await ffmpeg.writeFile('video.mp4', videoData); // Save file as video.mp4 in FFmpeg system
      await ffmpeg.writeFile('arial.ttf', await fetchFile('https://raw.githubusercontent.com/ffmpegwasm/testdata/master/arial.ttf'));
      
      setConverting(true)
      await ffmpeg.exec([
        '-i', 
        'video.mp4', 
        '-vf', 
        `fps=${FramesPS},scale=${Size}:-1:flags=lanczos,drawtext=fontfile=/arial.ttf:text='${Text}':x=(w-text_w)/2:y=10:fontsize=24:fontcolor=white`,
        'output.gif'
      ]);

   

      const gifData = await ffmpeg.readFile('output.gif'); 
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
    setPlaceholder(event.target.files[0].name)
  }

  function handleSizeChange(event){
    setSize(event.target.value)
  }

  function handleFramesPSChange(event){
    setFramesPS(event.target.value)
  }

  function handleSettingsMenu(){
    setSettingsMenu(!SettingsMenu)
  }


  const headerText = "Video To Gif Converter"
  return (
    <div className="Container">
      <div className="Converter">
          <div className='Header'>
            <h1 style={{display:"flex"}}>
            {headerText.split("").map((char, index) => {
      return <motion.p
            initial={{filter:"blur(2px)",opacity:0,x:200}}
            animate={{filter:"blur(0px)",opacity:1,x:0}}
            viewport={{ once: true }}
            key={index}
            style={{width: (char== " ") ? "10px" : "fit-content"}}
            transition={{duration:0.5,ease:"circInOut",delay:index*0.02}}
            >{char == " " ? " " : char}
            </motion.p>;
    })}
            </h1>
          </div>

        <div className='InputsContainer'>
              <div className='Inputs'>
                <div className='Inputs1' >
                  <input type="file" placeholder={Placeholder} onChange={handleFileChange}/>
                  <motion.button whileHover={{scale:1.1}} whileTap={{scale:0.9}} onClick={ConvertFile}>Convert</motion.button>
                </div>
                <br></br>
                <motion.button   whileHover={{scale:1.1}} whileTap={{scale:0.9}} onClick={handleSettingsMenu}>Settings 🔽</motion.button>

              </div>
              <motion.div className='Settings' 
              animate={{ height: SettingsMenu ? 'auto' : "0px", opacity: SettingsMenu ? 1 : 1 ,padding:SettingsMenu ? "20px" : "0px"}}
              transition={{duration:0.5, ease:"circInOut"}}
              >
                <div className='Setting'>
                  <label for="Size" style={{position:"absolute",top:0}}>Size {Size}</label>
                  <input type='range' className='Range' min="100" max="1000" id='Size' value={Size} onChange={handleSizeChange}></input>
                </div>

                <div className='Setting'>
                  <label for="Fps"  style={{position:"absolute",top:0}}>Fps {FramesPS}</label>
                  <input type='range' className='Range' min="15" max="35" id='Fps' value={FramesPS} onChange={handleFramesPSChange}></input>
                </div>
                <div className='Setting'>
                  <input type='text' id='txt' placeholder='Text overlay' value={Text} onChange={(event)=>{setText(event.target.value)}}></input>
                </div>
              </motion.div>
          </div>
          <div className='OutputContainer'>
          <div className="Output">
            <AnimatePresence>
            <br></br><br></br>
              {Converting ? (
                <motion.div
                  key="converting"
                  style={{position:"absolute"}}
                  initial={{ opacity: 0 , filter:"blur(5px)"}}
                  animate={{ opacity: 1,filter:"blur(0px)" }}
                  exit={{ opacity: 0,filter:"blur(5px)" }}
                  transition={{ duration: 0.3, ease:"circInOut" }}
                >
                  

                  <div style={{width:"200px", backgroundColor:"#101010",position:"relative",display:"flex",color:"#101010",borderRadius:"20px"}}>
                  <br></br>
                    <div style={{color:"#91ff78",position:"absolute", backgroundColor:"#91ff78",width:`${ConvertingProgress.progress}%`,transition:"0.25s ease",borderRadius:"20px"}}>
                    <br></br>
                    </div>
                  </div>

                   <p style={{textAlign:"center"}}>Elapsed time {ConvertingProgress.time.toFixed(1)}s</p>
                </motion.div>
              ) : (
                gifUrl && (
                  <motion.img
                    key="gif"
                    src={gifUrl}
                    className='GifOutput'
                    alt="Converted GIF"
                    initial={{ opacity: 0, width:"0%",height:"0%",padding:"0px" }}
                    animate={{ opacity: 1,width:"100%",height:"100%",padding:"20px 20px" }}
                    exit={{ opacity: 0,width:"0%",height:"0%",padding:"0px" }}
                    transition={{ duration:  0.5, ease:"circInOut"}}
                  />
                )
              )}
            </AnimatePresence>
          </div>
          
          </div>
      </div>

    </div>
  );
}
