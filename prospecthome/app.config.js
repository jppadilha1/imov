module.exports = {
  
  expo: {
    owner: "jppadilha",
    name: "prospect-home",
    slug: "prospect-home",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/prospect-home-logo.png",
    scheme: "prospecthome",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.jppadilha.prospecthome",
      infoPlist: {
        UIBackgroundModes: ["fetch", "processing"],
      },
    },
    android: {
      package: "com.jppadilha.prospecthome",
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_ANDROID_KEY,
        },
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/prospect-home-logo.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#FFFFFF",
          dark: {
            backgroundColor: "#FFFFFF",
          },
        },
      ],
      "expo-sqlite",
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission:
            "Precisamos de sua localização para rastrear ondes as fotos foram tiradas.",
        },
      ],
      [
        "expo-image-picker",
        {
          cameraPermission:
            "O app precisa de acesso a câmera para capturar fotos dos prospectos.",
        },
      ],
      "expo-task-manager",
      "expo-background-fetch",
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      supabaseUrl: process.env.SUPABASE_URL ?? "",
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? "",
      appEnv: process.env.APP_ENV ?? "development",
      "eas": {
        "projectId": "4edbbd33-e744-4bfb-ab0e-2351c821cb84",
      }
      
    },
    
  },
};
