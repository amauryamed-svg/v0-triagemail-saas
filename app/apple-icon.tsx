import { ImageResponse } from "next/og"

export const runtime = "edge"
export const size = { width: 180, height: 180 }
export const contentType = "image/png"

/**
 * Apple touch icon — Emily sobre fondo brand, 180x180 para iOS home screen.
 */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#7C7AED",
          borderRadius: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="160" height="160" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="14" r="11.2" fill="white" />
          <circle cx="5.5" cy="11.5" r="2.6" fill="white" />
          <circle cx="26.5" cy="11.5" r="2.6" fill="white" />
          <circle cx="9" cy="5" r="2.4" fill="white" />
          <circle cx="23" cy="5" r="2.4" fill="white" />
          <circle cx="16" cy="3.2" r="2.7" fill="white" />
          <circle cx="6.2" cy="17.5" r="2.4" fill="white" />
          <circle cx="25.8" cy="17.5" r="2.4" fill="white" />
          <ellipse cx="16" cy="18.5" rx="4.6" ry="5.1" fill="white" />
          <rect x="14.4" y="22.5" width="3.2" height="3" rx="0.6" fill="white" />
          <g stroke="#0A0A0B" strokeWidth="0.85" fill="none">
            <circle cx="13.8" cy="17.6" r="1.9" />
            <circle cx="18.2" cy="17.6" r="1.9" />
            <line x1="15.7" y1="17.6" x2="16.3" y2="17.6" strokeLinecap="round" />
            <line x1="11.9" y1="17.55" x2="11" y2="17.4" strokeLinecap="round" />
            <line x1="20.1" y1="17.55" x2="21" y2="17.4" strokeLinecap="round" />
          </g>
          <circle cx="13.8" cy="17.6" r="0.72" fill="#0A0A0B" />
          <circle cx="18.2" cy="17.6" r="0.72" fill="#0A0A0B" />
          <path
            d="M14.3 21.2 Q16 22.2 17.7 21.2"
            stroke="#0A0A0B"
            strokeWidth="0.7"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>
    ),
    { ...size },
  )
}
