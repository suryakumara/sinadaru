import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, StyleSheet } from "react-native";
import { C } from "../../constants/Colors";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

function TabIcon({
  name,
  color,
  focused,
}: {
  name: IconName;
  color: string;
  focused: boolean;
}) {
  return (
    <View style={[s.iconWrapper, focused && s.iconActive]}>
      <Ionicons name={name} size={22} color={focused ? C.white : C.text2} />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.white,
        tabBarInactiveTintColor: C.text2,
        tabBarStyle: s.tabBar,
        tabBarLabelStyle: s.tabLabel,
      }}
    >
      <Tabs.Screen
        name="map"
        options={{
          title: "Peta",
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? "map" : "map-outline"} color="" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="navigate"
        options={{
          title: "Navigasi",
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? "navigate" : "navigate-outline"} color="" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="directory"
        options={{
          title: "Kios",
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? "storefront" : "storefront-outline"} color="" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Pengaturan",
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? "settings" : "settings-outline"} color="" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const s = StyleSheet.create({
  tabBar: {
    backgroundColor: C.surface,
    borderTopColor: C.border,
    borderTopWidth: 1,
    height: 68,
    paddingBottom: 10,
    paddingTop: 6,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "600",
  },
  iconWrapper: {
    width: 40,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  iconActive: {
    backgroundColor: C.primary,
  },
});
