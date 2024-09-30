import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const adjectives = ['Red', 'Green', 'Blue', 'Yellow', 'Purple', 'Orange', 'Pink', 'Black', 'White', 'Gray']
const nouns = ['Apple', 'Sky', 'Ocean', 'Lemon', 'Berry', 'Flower', 'Sunset', 'Moon', 'Coal', 'Snow']

export function generateRandomColorName() {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  return `${adjective} ${noun}`
}
