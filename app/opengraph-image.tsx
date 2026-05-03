import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Me llevo tu inbox los sábados. — Emily, tu asistente. TriageMail · Vercel Zero to Agent."
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

/**
 * OG image. Hook = protagonista (mismo tipo y peso que Screen 1 hero), Emily
 * firma abajo. Vercel hackathon showcase, LinkedIn, X y Slack la usan como
 * thumbnail — el primer impacto debe ser la frase "Me llevo tu inbox los
 * sábados", no un saludo. Continuidad visual con la primera pantalla del
 * sitio para que el clickthrough no rompa.
 */
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(135deg, #0A0A0B 0%, #14141A 55%, #1A1A24 100%)",
          color: "#EDEDED",
          padding: "64px 80px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Grid sutil — refleja Screen 1 */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            opacity: 0.04,
            display: "flex",
          }}
        />
        {/* Glow blob top-right */}
        <div
          style={{
            position: "absolute",
            top: -240,
            right: -240,
            width: 720,
            height: 720,
            borderRadius: 720,
            background:
              "radial-gradient(circle, rgba(124,122,237,0.28) 0%, rgba(124,122,237,0.10) 35%, rgba(124,122,237,0) 70%)",
            display: "flex",
          }}
        />
        {/* Glow blob bottom-left */}
        <div
          style={{
            position: "absolute",
            bottom: -200,
            left: -200,
            width: 520,
            height: 520,
            borderRadius: 520,
            background:
              "radial-gradient(circle, rgba(124,122,237,0.16) 0%, rgba(124,122,237,0) 65%)",
            display: "flex",
          }}
        />

        {/* TOP — eyebrow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontSize: 16,
              color: "#9794FF",
              letterSpacing: "0.24em",
              fontWeight: 700,
              display: "flex",
            }}
          >
            TRIAGEMAIL · AI-POWERED MAIL TRIAGE AGENT
          </div>
        </div>

        {/* MIDDLE — hook gigante */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            zIndex: 1,
            marginTop: -8,
          }}
        >
          <div
            style={{
              fontSize: 132,
              fontWeight: 800,
              lineHeight: 0.92,
              letterSpacing: "-0.035em",
              color: "white",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>Me llevo tu inbox</span>
            <span style={{ color: "rgba(255,255,255,0.85)" }}>los sábados.</span>
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 30,
              lineHeight: 1.3,
              color: "#B8B8C2",
              display: "flex",
              gap: 12,
            }}
          >
            <span style={{ color: "#EDEDED" }}>Tú apruebas.</span>
            <span>Yo nunca envío sola.</span>
          </div>
        </div>

        {/* BOTTOM — firma Emily + footer hackathon */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 1,
          }}
        >
          {/* Firma Emily */}
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 18,
                background: "#7C7AED",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 14px 36px rgba(124,122,237,0.35)",
              }}
            >
              <svg width="58" height="58" viewBox="0 0 32 32" fill="none">
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
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
              <span
                style={{
                  fontSize: 13,
                  color: "#8A8A95",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  display: "flex",
                }}
              >
                Te lo firma
              </span>
              <span
                style={{
                  fontSize: 22,
                  color: "white",
                  fontWeight: 700,
                  marginTop: 4,
                  display: "flex",
                }}
              >
                Emily — tu asistente
              </span>
            </div>
          </div>

          {/* Footer hackathon */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            <span style={{ color: "#7C7AED" }}>Vercel Zero to Agent</span>
            <span style={{ color: "#3A3A45" }}>·</span>
            <span style={{ color: "#9A9A9A" }}>Track 2</span>
            <span style={{ color: "#3A3A45" }}>·</span>
            <span style={{ color: "#9A9A9A" }}>#ZeroToAgent</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
