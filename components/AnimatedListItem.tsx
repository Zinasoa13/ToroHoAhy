"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { Animated, TouchableOpacity, Text, View } from "react-native"
import { useTheme } from "../contexts/ThemeContext"

interface Recording {
  id: string
  uri: string
  name: string
  date: string
}

interface AnimatedListItemProps {
  item: Recording
  index: number
  onPlay: (uri: string) => void
}

export const AnimatedListItem: React.FC<AnimatedListItemProps> = ({ item, index, onPlay }) => {
  const { isDark } = useTheme()
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const scaleAnim = useRef(new Animated.Value(0.8)).current

  useEffect(() => {
    const delay = index * 100 // Décalage pour effet cascade

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
      }}
      className={`mx-4 mb-3 p-4 rounded-2xl shadow-lg ${
        isDark ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-100"
      }`}
    >
      <View className="flex-row justify-between items-center">
        <View className="flex-1 mr-3">
          <Text className={`font-bold text-lg ${isDark ? "text-white" : "text-gray-900"}`}>{item.name}</Text>
          <Text className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>{item.date}</Text>
        </View>
        <TouchableOpacity
          onPress={() => onPlay(item.uri)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 rounded-full shadow-md"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <Text className="text-white font-bold text-">▶</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  )
}
