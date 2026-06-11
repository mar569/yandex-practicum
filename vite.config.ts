import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    host: '::',
    proxy: {
      '/api': {
        target: 'https://ya-praktikum.tech',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: {
          '*': 'localhost',
        },
        cookiePathRewrite: {
          '*': '/',
        },
      },
    },
  },
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        login: path.resolve(__dirname, 'static/login.html'),
        register: path.resolve(__dirname, 'static/register.html'),
        chats: path.resolve(__dirname, 'static/chats.html'),
        profile: path.resolve(__dirname, 'static/profile.html'),
        profileEdit: path.resolve(__dirname, 'static/profile-edit.html'),
        profilePassword: path.resolve(
          __dirname,
          'static/profile-password.html'
        ),
        notFound: path.resolve(__dirname, 'static/404.html'),
        serverError: path.resolve(__dirname, 'static/500.html'),
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
