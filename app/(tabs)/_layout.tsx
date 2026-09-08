import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { ComponentProps, useEffect } from "react";
import { ColorValue, Platform, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { FluiColors, FluiFonts, Motion } from "@/constants/theme";


function TabIcon({
  name,
  color,
  focused,
}: {
  name: ComponentProps<typeof Ionicons>["name"];
  color: ColorValue;
  focused: boolean;
}) {
  const escala = useSharedValue(focused ? 1 : 0);
  const reduzirMovimento = useReducedMotion();

  useEffect(() => {
    const alvo = focused ? 1 : 0;
    escala.value = reduzirMovimento
      ? alvo
      : withSpring(alvo, Motion.spring);
  }, [focused, escala, reduzirMovimento]);

  const estiloIcone = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + escala.value * 0.08 }],
  }));

  const estiloPonto = useAnimatedStyle(() => ({
    opacity: escala.value,
    transform: [{ scaleX: escala.value }],
  }));

  return (
    <View style={styles.iconWrapper}>
      <Animated.View style={estiloIcone}>
        <Ionicons name={name} size={24} color={color as string} />
      </Animated.View>
      <Animated.View style={[styles.dot, estiloPonto]} />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: FluiColors.primary,
        tabBarInactiveTintColor: FluiColors.mutedText,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontFamily: FluiFonts.inter.medium,
          fontSize: 11,
        },
        tabBarItemStyle: {
          paddingTop: 8,
        },
        tabBarStyle: {
          backgroundColor: FluiColors.surface,
          borderTopColor: FluiColors.surfaceAlt,
          borderTopWidth: StyleSheet.hairlineWidth,
          elevation: 0,
          height: Platform.OS === "ios" ? 88 : 72,
          paddingBottom: Platform.OS === "ios" ? 28 : 10,
          shadowOpacity: 0,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarAccessibilityLabel: "Início",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? "home" : "home-outline"}
              color={color}
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: "Busca",
          tabBarAccessibilityLabel: "Buscar pontos de recarga no mapa",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? "search" : "search-outline"}
              color={color}
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarAccessibilityLabel: "Seu perfil e veículos",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? "person-circle" : "person-circle-outline"}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  dot: {
    backgroundColor: FluiColors.primary,
    borderRadius: 2,
    height: 3,
    marginTop: 4,
    width: 18,
  },
  iconWrapper: {
    alignItems: "center",
  },
});
