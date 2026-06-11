import 'dotenv/config';

export default {
  expo: {
    name: "N's Lavandería",
    slug: "ns-lavanderia",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "cover",
      backgroundColor: "#2a3350"
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTabletMode: true,
      bundleIdentifier: "com.nslavanderia.app"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#2a3350"
      },
      package: "com.nslavanderia.app"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      [
        "@stripe/stripe-react-native",
        {
          merchantIdentifier: "merchant.com.nslavanderia"
        }
      ]
    ],
    scheme: "nslavanderia"
  }
};
