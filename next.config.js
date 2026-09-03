const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  // ADRESSA est utilisée par des agents terrain avec une connexion parfois faible ou nulle.
  // On met en cache l'application (shell) et les pages d'adresses déjà consultées
  // pour permettre une consultation même hors ligne.
  workboxOptions: {
    disableDevLogs: true
  }
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" }
    ]
  }
};

module.exports = withPWA(nextConfig);
