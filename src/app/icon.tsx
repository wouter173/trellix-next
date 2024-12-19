import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const dyanmic = 'force-static'
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div tw="flex items-center justify-center w-full h-full bg-black rounded-lg">
        <svg width="14" height="20" viewBox="0 0 14 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M5.03462 3.94238H0.999999C0.447714 3.94238 0 3.49467 0 2.94238V1.44238C0 0.890098 0.447715 0.442383 1 0.442383H13C13.5523 0.442383 14 0.890098 14 1.44238V2.94238C14 3.49467 13.5523 3.94238 13 3.94238H6.57185L8.96539 5.7659V18.5578C8.96539 19.1101 8.51767 19.5578 7.96539 19.5578H6.03462C5.48233 19.5578 5.03462 19.1101 5.03462 18.5578V3.94238Z"
            fill="white"
          />
        </svg>
      </div>
    ),
    { ...size },
  )
}
