# Recorder
import os
import wave
import pyaudio

# Shazam
from ShazamAPI import Shazam

class GnomeShazam():
    def __init__(self, filename, maxAttempt = 10):
        self.filename = filename
        self.maxAttempt = maxAttempt
    
    def Recognize(self):
        Attempt = self.maxAttempt
        song = None
        while Attempt > 0:
            Attempt -= 1
            mp3_file_content_to_recognize = open(self.filename, 'rb').read()
            shazam = Shazam(mp3_file_content_to_recognize)
            recognize_generator = shazam.recognizeSong()
            try:
                read = next(recognize_generator)
                title = read[1]['track']['share']['subject']
                shazam = read[1]['track']['share']['href']
                
                #song = "{} - {}".format(title, artist)
                #song = read[1]
                song = title
                Attempt = 0
            except Exception as ex:
                pass
        return song

class Recorder():
    def __init__(self, filename, duration, start = False):
        self.filename = filename
        self.duration = duration
        if start: self.Start()
    
    def Start(self):
        CHUNK = 1024
        FORMAT = pyaudio.paInt16
        CHANNELS = 2
        RATE = 44100

        p = pyaudio.PyAudio()

        stream = p.open(format=FORMAT,
                        channels=CHANNELS,
                        rate=RATE,
                        input=True,
                        frames_per_buffer=CHUNK)

        frames = []
        for i in range(0, int(RATE / CHUNK * self.duration)):
            data = stream.read(CHUNK)
            frames.append(data)

        stream.stop_stream()
        stream.close()
        p.terminate()

        wf = wave.open(self.filename, 'wb')
        wf.setnchannels(CHANNELS)
        wf.setsampwidth(p.get_sample_size(FORMAT))
        wf.setframerate(RATE)
        wf.writeframes(b''.join(frames))
        wf.close()
    
    def Clear(self):
        os.remove(self.filename)