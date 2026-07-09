import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Termite',
    short_name: 'Termite',
    description: 'Control de producción · Carpintería',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#F7F3EE',
    theme_color: '#B85C38',
    orientation: 'portrait',
    icons: [
      { src: '/termita.png', sizes: '192x192', type: 'image/png' },
      { src: '/termita.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
