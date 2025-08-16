"use client"
import { TouchableOpacity, View, Animated } from "react-native"
import { useTheme } from "../contexts/ThemeContext"
import { useRef } from "react"

export const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme()
  const scaleAnim = useRef(new Animated.Value(1)).current
  const rotateAnim = useRef(new Animated.Value(0)).current

  const handlePress = () => {
    Animated.parallel([
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      rotateAnim.setValue(0)
    })

    toggleTheme()
  }

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  return (
    <View
      style={{
        position: "absolute",
        top: -18,
        right: 2,
        zIndex: 100, // Assure que le bouton est au-dessus des autres éléments
      }}
    >
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }, { rotate: rotateInterpolate }],
        }}
      >
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.7}
          style={{
            width: 40,
            height: 40,
            borderRadius: 28,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: isDark ? "#1f2937" : "#ffffff",
            borderWidth: 2,
            borderColor: isDark ? "#374151" : "#e5e7eb",
            shadowColor: isDark ? "#3b82f6" : "#6366f1",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 12,
              backgroundColor: isDark ? "#fbbf24" : "#3b82f6",
              position: "relative",
            }}
          >
            {isDark && (
              <View
                style={{
                  position: "absolute",
                  right: -4,
                  width: 15,
                  height: 15,
                  borderRadius: 10,
                  backgroundColor: "#1f2937",
                }}
              />
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  )
}