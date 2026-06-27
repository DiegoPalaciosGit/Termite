declare module 'next/headers' {
  import type { ReadonlyRequestCookies } from '@supabase/ssr'

  export function cookies(): Promise<{
    getAll(): { name: string; value: string }[]
    set(name: string, value: string, options?: Record<string, unknown>): void
    get(name: string): { name: string; value: string } | undefined
  }>
  export function headers(): Promise<Headers>
  export function draftMode(): Promise<{ isEnabled: boolean; enable(): void; disable(): void }>
}

declare module 'next/image' {
  import * as React from 'react'
  interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string
    width?: number
    height?: number
    priority?: boolean
    fill?: boolean
    quality?: number
    placeholder?: 'blur' | 'empty'
    blurDataURL?: string
    unoptimized?: boolean
  }
  const Image: React.FC<ImageProps>
  export default Image
}
