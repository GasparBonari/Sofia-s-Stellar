import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        assetFileNames: '[assetPath][name].[ext]'
      },
      input: 'src/main.js',
    }
  },
  assetsInclude: ['**/*.glb', '**/*.gltf', '**/*.fbx', '**/*.jpg', '**/*.png'],
});