import React, { useState } from 'react';
import { Button, Text, View } from 'react-native';
import { Audio } from 'expo-av';
import axios from 'axios';

const BACKEND_URL = 'http://127.0.0.1:8980';  // Replace YOUR_LOCAL_IP with your computer's IP address

export default function App() {
  const [recording, setRecording] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState('');
  
  async function startRecording() {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === 'granted') {
        await Audio.setAudioModeAsync({ allowsRecordingIOS: true });
        const { recording } = await Audio.Recording.createAsync(
          Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
        );
        setRecording(recording);
      } else {
        setError('Permission to access microphone was denied');
      }
    } catch (err) {
      console.error('Failed to start recording', err);
      setError('Failed to start recording');
    }
  }

  async function stopRecording() {
    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    console.log('Recording URI:', uri);  // Log the URI of the recording

    const formData = new FormData();
    formData.append('file', {
      uri,
      type: 'audio/m4a',  // Check if the type matches the recorded file
      name: 'audio.m4a',  // Ensure that the name reflects the correct file extension
    });

    // Debug the formData contents
    formData.forEach((value, key) => {
        console.log(key, value);
    });

    try {
      const response = await axios.post(`${BACKEND_URL}/transcribe/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setTranscription(response.data.transcription);
      setError('');
    } catch (err) {
      console.error('Error sending audio to backend', err);
      setError(`Error: ${err.message}. ${err.response?.data?.error || ''}`);
    }
}


  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button
        title={recording ? 'Stop Recording' : 'Start Recording'}
        onPress={recording ? stopRecording : startRecording}
      />
      {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}
      <Text>Transcription: {transcription}</Text>
    </View>
  );
}