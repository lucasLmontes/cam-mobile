import { CameraView, Camera, CameraType } from 'expo-camera';
import { useState, useEffect, useRef } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';

export default function App() {
  const [facing, setFacing] = useState<CameraType>('back' as CameraType);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      const microphonePermission = await Camera.requestMicrophonePermissionsAsync();
      setHasPermission(
        cameraPermission.status === 'granted' && 
        microphonePermission.status === 'granted'
      );
    })();
  }, []);

  if (hasPermission === null) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (hasPermission === false) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Precisamos da sua permissão para usar a câmera e o microfone</Text>
        <Button onPress={() => {
          Camera.requestCameraPermissionsAsync();
          Camera.requestMicrophonePermissionsAsync();
        }} title="Conceder Permissão" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' as CameraType : 'back' as CameraType));
  }
  
  const startRecording = async () => {
    if (cameraRef.current) {
      setIsRecording(true);
      try {
        await cameraRef.current.recordAsync();
      } catch (error) {
        console.error('Erro ao gravar vídeo:', error);
      }
    }
  };

  const stopRecording = async () => {
    if (cameraRef.current && isRecording) {
      setIsRecording(false);
      cameraRef.current.stopRecording();
      Alert.alert('Sucesso', 'Vídeo feito com sucesso!');
    }
  };

  return (
    <View style={styles.container}>
      <CameraView 
        style={styles.camera} 
        facing={facing}
        ref={cameraRef}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
          <Text style={styles.text}>Virar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.recordButton, isRecording && styles.recordingButton]} 
          onPress={isRecording ? stopRecording : startRecording}
        >
          <Text style={styles.text}>{isRecording ? 'Parar' : 'Gravar'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 30,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  flipButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 50,
    padding: 15,
    width: 100,
  },
  recordButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    borderRadius: 50,
    padding: 15,
    width: 100,
  },
  recordingButton: {
    backgroundColor: 'rgba(255, 0, 0, 1)',
    borderWidth: 3,
    borderColor: 'white',
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});