"use client"

import { Text, View, TouchableOpacity, Animated, FlatList } from "react-native"
import { useState, useRef, useEffect } from "react"
import { Audio } from "expo-av"
import { LinearGradient } from "expo-linear-gradient"
import { useTheme } from "../contexts/ThemeContext"
import { ThemeToggle } from "./ThemeToggle"
import { AnimatedListItem } from "./AnimatedListItem"
import { FloatingElements } from "./FloatingElements"
import LottieView from "lottie-react-native"

interface Recording {
  id: string
  uri: string
  name: string
  date: string
}

export const ScreenContent = () => {
  const { isDark } = useTheme()
  const [recording, setRecording] = useState<Audio.Recording | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [currentSound, setCurrentSound] = useState<Audio.Sound | null>(null)
  const animationRef = useRef<LottieView>(null)

  const buttonScale = useRef(new Animated.Value(1)).current
  const pulseAnim = useRef(new Animated.Value(1)).current
  const titleFade = useRef(new Animated.Value(0)).current
  const micRotate = useRef(new Animated.Value(0)).current

  useEffect(() => {
    animationRef.current?.play()
  }, [])

  useEffect(() => {
    Animated.timing(titleFade, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start()

    return () => {
      if (recording) {
        recording.stopAndUnloadAsync()
      }
      if (currentSound) {
        currentSound.unloadAsync()
      }
    }
  }, [recording, currentSound])

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.timing(micRotate, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ).start()

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
      micRotate.stopAnimation()
      micRotate.setValue(0)
      pulseAnim.setValue(1)
    }
  }, [isRecording])

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync()
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      })

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
        web: {}
      })

      setRecording(recording)
      setIsRecording(true)

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

  const stopRecording = async () => {
    if (!recording) return

    setIsRecording(false)

    try {
      await recording.stopAndUnloadAsync()
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      })

      const uri = recording.getURI()
      if (uri) {
        const newRecording = {
          id: Date.now().toString(),
          uri: uri,
          name: `🎵 Rakitra ${recordings.length + 1}`,
          date: new Date().toLocaleString("fr-FR"),
        }
        setRecordings((prev) => [newRecording, ...prev])
      }
      setRecording(null)
    } catch (err) {
      console.error("Erreur arrêt enregistrement", err)
    }
  }

  const playRecording: (uri: string) => Promise<void> = async (uri: string) => {
    try {
      if (currentSound) {
        await currentSound.unloadAsync()
      }

      const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true })

      setCurrentSound(sound)
      await sound.playAsync()
    } catch (err) {
      console.error("Erreur lecture audio", err)
    }
  }

  const micRotateInterpolate = micRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  return (
    <View className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <LinearGradient
        colors={isDark ? ["#0f172a", "#1e293b", "#334155"] : ["#f1f5f9", "#e2e8f0", "#cbd5e1"]}
        className="absolute inset-0"
      />

      <FloatingElements />

      <View className="flex-1 px-6 pt-12">
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

        <Animated.View
          style={{
            transform: [{ scale: buttonScale }, { scale: pulseAnim }],
          }}
          className="items-center mb-8"
        >
          <TouchableOpacity
            onPress={isRecording ? stopRecording : startRecording}
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
            {/* Animated microphone icon or stop button */}
            <Animated.View
              // Apply rotation animation to the icon when recording
              style={{
                transform: [{ rotate: micRotateInterpolate }],
              }}
            >
              {/* Display stop icon when recording, microphone icon otherwise */}
              <Text className="text-4xl">{isRecording ? "⏹" : "🎙️"}</Text>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>

        <View className="flex-1">
          <Text className={`text-xl font-bold mb-4 px-4 ${isDark ? "text-white" : "text-gray-900"}`}>
            Ny rakitra ✨
          </Text>

          {recordings.length > 0 ? (
            <FlatList
              data={recordings}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => <AnimatedListItem item={item} index={index} onPlay={playRecording} />}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              decelerationRate="fast"
              scrollEventThrottle={16}
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              windowSize={10}
            />
          ) : (
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
