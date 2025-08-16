"use client"

import { Text, View, TouchableOpacity, Animated, FlatList } from "react-native"
import { useState, useRef, useEffect } from "react"
import { Audio } from "expo-av" // Expo pour gérer l'audio (enregistrement / lecture)
import { LinearGradient } from "expo-linear-gradient" // Dégradé d'arrière-plan
import { useTheme } from "../contexts/ThemeContext" // Contexte de thème (sombre/clair)
import { ThemeToggle } from "./ThemeToggle" // Bouton pour basculer le thème
import { AnimatedListItem } from "./AnimatedListItem" // Item animé de la liste des enregistrements
import { FloatingElements } from "./FloatingElements" // Éléments flottants décoratifs
import LottieView from "lottie-react-native" // Animations Lottie (JSON animés)


// Structure représentant un enregistrement audio
interface Recording {
  id: string
  uri: string
  name: string
  date: string
}

export const ScreenContent = () => {
  const { isDark } = useTheme() // Récupère si on est en thème sombre
  const [recording, setRecording] = useState<Audio.Recording | null>(null) // Enregistrement en cours
  const [isRecording, setIsRecording] = useState(false) // État "enregistrement en cours"
  const [recordings, setRecordings] = useState<Recording[]>([]) // Liste des enregistrements terminés
  const [currentSound, setCurrentSound] = useState<Audio.Sound | null>(null) // Son actuellement joué
  const animationRef = useRef<LottieView>(null) // Référence à l’animation Lottie

  // Animations
  const buttonScale = useRef(new Animated.Value(1)).current // Animation d’échelle du bouton
  const pulseAnim = useRef(new Animated.Value(1)).current // Effet pulsation
  const titleFade = useRef(new Animated.Value(0)).current // Apparition du titre
  const micRotate = useRef(new Animated.Value(0)).current // Rotation du micro quand ça enregistre

  // Lance l’animation Lottie au montage
  useEffect(() => {
    animationRef.current?.play()
  }, [])

  // Animation du titre + nettoyage si enregistrement ou son actif
  useEffect(() => {
    Animated.timing(titleFade, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start()

    return () => {
      if (recording) {
        recording.stopAndUnloadAsync() // Arrêter proprement un enregistrement
      }
      if (currentSound) {
        currentSound.unloadAsync() // Décharger un son en lecture
      }
    }
  }, [recording, currentSound])

  // Animation micro & pulsation quand on enregistre
  useEffect(() => {
    if (isRecording) {
      // Rotation infinie du micro
      Animated.loop(
        Animated.timing(micRotate, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ).start()

      // Effet pulsation du bouton
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ).start()
    } else {
      // Réinitialiser les animations si on arrête
      micRotate.stopAnimation()
      micRotate.setValue(0)
      pulseAnim.setValue(1)
    }
  }, [isRecording])

  // Fonction pour démarrer l'enregistrement
  const startRecording = async () => {
    try {
      // Demande permission micro
      await Audio.requestPermissionsAsync()
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      })

      // Création d’un enregistrement avec paramètres spécifiques Android/iOS
      const { recording } = await Audio.Recording.createAsync({
        android: {
          extension: ".wav",
          outputFormat: Audio.AndroidOutputFormat.DEFAULT,
          audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: ".wav",
          outputFormat: Audio.IOSOutputFormat.LINEARPCM,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {} // (pas encore géré mais obligatoire)
      })

      setRecording(recording)
      setIsRecording(true)

      // Animation du bouton qui se réduit légèrement
      Animated.spring(buttonScale, {
        toValue: 0.95,
        tension: 150,
        friction: 8,
        useNativeDriver: true,
      }).start()
    } catch (err) {
      console.error("Erreur démarrage enregistrement", err)
    }
  }

  // Fonction pour arrêter l'enregistrement
  const stopRecording = async () => {
    if (!recording) return

    setIsRecording(false)

    try {
      await recording.stopAndUnloadAsync() // Arrête l’enregistrement
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      })

      const uri = recording.getURI()
      if (uri) {
        // Ajoute un nouvel enregistrement dans la liste
        const newRecording = {
          id: Date.now().toString(),
          uri: uri,
          name: `🎵 Rakitra ${recordings.length + 1}`,
          date: new Date().toLocaleString("fr-FR"),
        }
        setRecordings((prev) => [newRecording, ...prev]) // Insère en haut de la liste
      }
      setRecording(null)
    } catch (err) {
      console.error("Erreur arrêt enregistrement", err)
    }
  }

  // Fonction pour lire un enregistrement audio
  const playRecording: (uri: string) => Promise<void> = async (uri: string) => {
    try {
      if (currentSound) {
        await currentSound.unloadAsync() // Décharger le son précédent
      }

      // Crée un nouvel objet Audio.Sound et lance la lecture
      const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true })

      setCurrentSound(sound)
      await sound.playAsync()
    } catch (err) {
      console.error("Erreur lecture audio", err)
    }
  }

  // Transformation pour animer la rotation du micro
  const micRotateInterpolate = micRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  return (
    <View className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      {/* Dégradé d’arrière-plan */}
      <LinearGradient
        colors={isDark ? ["#0f172a", "#1e293b", "#334155"] : ["#f1f5f9", "#e2e8f0", "#cbd5e1"]}
        className="absolute inset-0"
      />

      {/* Éléments flottants animés */}
      <FloatingElements />

      <View className="flex-1 px-6 pt-12">
        {/* Header avec titre et bouton de thème */}
        <View className="flex-row items-center justify-between mb-6 h-14">
          <Animated.View style={{ opacity: titleFade }} className="flex-1 justify-center">
            <Text
              className={`text-4xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
              style={{
                lineHeight: 44,
                includeFontPadding: false,
                textAlignVertical: "center",
              }}
            >
              ToroHoAhy
            </Text>
          </Animated.View>

          <View className="ml-4 justify-center">
            <ThemeToggle />
          </View>
        </View>

        {/* Bouton d'enregistrement */}
        <Animated.View
          style={{
            transform: [{ scale: buttonScale }, { scale: pulseAnim }],
          }}
          className="items-center mb-8"
        >
          <TouchableOpacity
            onPress={isRecording ? stopRecording : startRecording} // Démarre ou arrête l’enregistrement
            className={`w-24 h-24 rounded-full items-center justify-center shadow-2xl ${
              isRecording
                ? "bg-gradient-to-br from-red-500 to-pink-600"
                : "bg-gradient-to-br from-blue-500 to-purple-600"
            }`}
            style={{
              shadowColor: isRecording ? "#ef4444" : "#3b82f6",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.4,
              shadowRadius: 16,
              elevation: 12,
            }}
          >
            {/* Icône micro/stop animé */}
            <Animated.View
              style={{
                transform: [{ rotate: micRotateInterpolate }],
              }}
            >
              <Text className="text-4xl">{isRecording ? "⏹" : "🎙️"}</Text>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>

        {/* Liste des enregistrements */}
        <View className="flex-1">
          <Text className={`text-xl font-bold mb-4 px-4 ${isDark ? "text-white" : "text-gray-900"}`}>
            Ny rakitra ✨
          </Text>

          {recordings.length > 0 ? (
            <FlatList
              data={recordings}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => (
                <AnimatedListItem item={item} index={index} onPlay={playRecording} />
              )}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              decelerationRate="fast"
              scrollEventThrottle={16}
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              windowSize={10}
            />
          ) : (
            // Message quand aucun enregistrement
            <View className="flex-1 items-center justify-center">
              <LottieView
                ref={animationRef}
                source={isDark ? require("../assets/mic1.json") : require("../assets/mic2.json")}
                autoPlay
                loop
                style={{ width: 100, height: 100 }}
                speed={1.2}
              />
              <Text className={`text-lg mt-2 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                Tsy misy rakitra voarakitra
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  )
}
