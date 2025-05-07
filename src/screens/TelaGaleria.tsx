import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  Image
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { fetchUserVideos, Video as VideoType } from '../services/videoService';
import { FontAwesome } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const ITEM_WIDTH = width / COLUMN_COUNT - 16;

interface GalleryScreenProps {
  navigation: any;
}

export default function TelaGaleria({ navigation }: GalleryScreenProps) {
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<VideoType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const userVideos = await fetchUserVideos();
      setVideos(userVideos);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar vídeos. Por favor, tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const videoPlayer = (video: VideoType) => {
    setSelectedVideo(video);
  };

  const closePlayer = () => {
    setSelectedVideo(null);
  };

  const renderVideoItem = ({ item }: { item: VideoType }) => (
    <TouchableOpacity 
      style={styles.videoItem} 
      onPress={() => videoPlayer(item)}
    >
      <View style={styles.thumbnailContainer}>
        <Video
          source={{ uri: item.url }}
          style={styles.thumbnail}
          resizeMode={ResizeMode.COVER}
          shouldPlay={false}
          isMuted={true}
          useNativeControls={false}
        />
        <View style={styles.playIconContainer}>
          <FontAwesome name="play-circle" size={36} color="rgba(255,255,255,0.8)" />
        </View>
      </View>
      <Text style={styles.videoTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.videoDate}>
        {new Date(item.createdAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <FontAwesome name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meus Vídeos</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={loadVideos}
        >
          <FontAwesome name="refresh" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#1e88e5" />
          <Text style={styles.loaderText}>Carregando vídeos...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={loadVideos}
          >
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : videos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FontAwesome name="video-camera" size={64} color="#999" />
          <Text style={styles.emptyText}>Nenhum vídeo encontrado</Text>
          <Text style={styles.emptySubText}>Comece a gravar para ver seus vídeos aqui</Text>
        </View>
      ) : (
        <FlatList
          data={videos}
          renderItem={renderVideoItem}
          keyExtractor={(item) => item.id || item.createdAt.toString()}
          numColumns={COLUMN_COUNT}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {selectedVideo && (
        <View style={styles.videoPlayerContainer}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={closePlayer}
          >
            <FontAwesome name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Video
            source={{ uri: selectedVideo.url }}
            style={styles.videoPlayer}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay
            useNativeControls
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  backButton: {
    padding: 8,
  },
  refreshButton: {
    padding: 8,
  },
  listContainer: {
    padding: 8,
  },
  videoItem: {
    width: ITEM_WIDTH,
    margin: 8,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  thumbnailContainer: {
    position: 'relative',
    height: ITEM_WIDTH * 0.75,
    backgroundColor: '#eee',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  playIconContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    marginHorizontal: 8,
    color: '#333',
  },
  videoDate: {
    fontSize: 12,
    color: '#888',
    marginHorizontal: 8,
    marginBottom: 8,
    marginTop: 2,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#e53935',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#1e88e5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
  },
  videoPlayerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    zIndex: 1000,
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1001,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
});