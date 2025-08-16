"use client"
import { View, Animated } from "react-native"
import { useEffect, useRef } from "react"
import { useTheme } from "../contexts/ThemeContext"

export const FloatingElements = () => {
  const { isDark } = useTheme()
  const float1 = useRef(new Animated.Value(0)).current
  const float2 = useRef(new Animated.Value(0)).current
  const float3 = useRef(new Animated.Value(0)).current
  const rotate1 = useRef(new Animated.Value(0)).current
  const rotate2 = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Animation flottante pour les éléments
    const createFloatingAnimation = (animValue: Animated.Value, duration: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: duration,
            useNativeDriver: true,
          }),
        ])
      )
    }

    // Animation de rotation
    const createRotationAnimation = (animValue: Animated.Value, duration: number) => {
      return Animated.loop(
        Animated.timing(animValue, {
          toValue: 1,
          duration: duration,
          useNativeDriver: true,
        })
      )
    }

    createFloatingAnimation(float1, 3000).start()
    createFloatingAnimation(float2, 4000).start()
    createFloatingAnimation(float3, 5000).start()
    createRotationAnimation(rotate1, 8000).start()
    createRotationAnimation(rotate2, 12000).start()
  }, [])

  const float1Y = float1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  })

  const float2Y = float2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -30],
  })

  const float3Y = float3.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  })

  const rotate1Deg = rotate1.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  const rotate2Deg = rotate2.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "-360deg"],
  })

  return (
    <View className="absolute inset-0 pointer-events-none">
      {/* Cercle flottant 1 */}
      <Animated.View
        style={{
          transform: [{ translateY: float1Y }, { rotate: rotate1Deg }],
        }}
        className={`absolute top-32 left-8 w-16 h-16 rounded-full opacity-20 ${
          isDark ? "bg-blue-400" : "bg-purple-400"
        }`}
      />

      {/* Cercle flottant 2 */}
      <Animated.View
        style={{
          transform: [{ translateY: float2Y }],
        }}
        className={`absolute top-48 right-12 w-12 h-12 rounded-full opacity-15 ${
          isDark ? "bg-purple-400" : "bg-blue-400"
        }`}
      />

      {/* Forme géométrique flottante */}
      <Animated.View
        style={{
          transform: [{ translateY: float3Y }, { rotate: rotate2Deg }],
        }}
        className={`absolute bottom-48 left-12 w-8 h-8 opacity-25 ${
          isDark ? "bg-pink-400" : "bg-indigo-400"
        }`}
      />

      {/* Particules musicales */}
      <Animated.View
        style={{
          transform: [{ translateY: float1Y }],
        }}
        className={`absolute top-64 right-8 w-6 h-6 rounded-full opacity-30 ${
          isDark ? "bg-green-400" : "bg-orange-400"
        }`}
      />

      <Animated.View
        style={{
          transform: [{ translateY: float2Y }],
        }}
        className={`absolute bottom-32 right-16 w-4 h-4 rounded-full opacity-20 ${
          isDark ? "bg-yellow-400" : "bg-red-400"
        }`}
      />
    </View>
  )
}
