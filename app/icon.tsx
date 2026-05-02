import { ImageResponse } from "next/og"

export const runtime = "edge"
export const size = { width: 32, height: 32 }
export const contentType = "image/png"

/**
 * Favicon dinámico — la cara de Emily sobre fondo brand lavender.
 * Reemplaza los icon-*.png que venían de v0.
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#7C7AED",
          borderRadius: 7,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
          {/* Afro halo */}
          <circle cx="16" cy="14" r="11.2" fill="white" />
          <circle cx="5.5" cy="11.5" r="2.6" fill="white" />
          <circle cx="26.5" cy="11.5" r="2.6" fill="white" />
          <circle cx="9" cy="5" r="2.4" fill="white" />
          <circle cx="23" cy="5" r="2.4" fill="white" />
          <circle cx="16" cy="3.2" r="2.7" fill="white" />
          <circle cx="6.2" cy="17.5" r="2.4" fill="white" />
          <circle cx="25.8" cy="17.5" r="2.4" fill="white" />
          {/* Cara */}
          <ellipse cx="16" cy="18.5" rx="4.6" ry="5.1" fill="white" />
          {/* Lentes */}
          <g stroke="#0A0A0B" strokeWidth="0.95" fill="none">
            <circle cx="13.8" cy="17.6" r="2" />
            <circle cx="18.2" cy="17.6" r="2" />
            <line x1="15.8" y1="17.6" x2="16.2" y2="17.6" strokeLinecap="round" />
          </g>
          {/* Ojos */}
          <circle cx="13.8" cy="17.6" r="0.8" fill="#0A0A0B" />
          <circle cx="18.2" cy="17.6" r="0.8" fill="#0A0A0B" />
        </svg>
      </div>
    ),
    { ...size },
  )
}
