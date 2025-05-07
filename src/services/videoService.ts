import { db, storage } from './firebaseConfig';
import { collection, addDoc, getDocs, query, orderBy, where } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import * as FileSystem from 'expo-file-system';

export interface Video {
  id?: string;
  title: string;
  url: string;
  thumbnail?: string;
  userId: string;
  createdAt: number;
  duration?: number;
  fileSize?: number;
}

export const saveVideo = async (videoUri: string) => {
  try {
    const auth = getAuth();
    if (!auth.currentUser) {
      throw new Error('Usuário não autenticado');
    }
    
    const userId = auth.currentUser.uid;
    const timestamp = Date.now();
    const filename = `videos/${userId}/${timestamp}.mp4`;
    
    const fileInfo = await FileSystem.getInfoAsync(videoUri);
    
    const response = await fetch(videoUri);
    const blob = await response.blob();
    
    const storageRef = ref(storage, filename);
    
    const uploadTask = uploadBytesResumable(storageRef, blob);
    
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload em progresso: ${progress}%`);
        },
        (error) => {
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          
          const videoData: Video = {
            title: `Vídeo de ${new Date(timestamp).toLocaleString()}`,
            url: downloadURL,
            userId: userId,
            createdAt: timestamp,
            fileSize: fileInfo.size || 0
          };
          
          const docRef = await addDoc(collection(db, 'videos'), videoData);
          resolve({ ...videoData, id: docRef.id });
        }
      );
    });
  } catch (error) {
    console.error('Erro ao salvar vídeo:', error);
    throw error;
  }
};

export const fetchUserVideos = async () => {
  try {
    const auth = getAuth();
    if (!auth.currentUser) {
      throw new Error('Usuário não autenticado');
    }
    
    const userId = auth.currentUser.uid;
    const videosQuery = query(
      collection(db, 'videos'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(videosQuery);
    const videos: Video[] = [];
    
    querySnapshot.forEach((doc) => {
      videos.push({ id: doc.id, ...doc.data() } as Video);
    });
    
    return videos;
  } catch (error) {
    console.error('Erro ao buscar vídeos:', error);
    throw error;
  }
};