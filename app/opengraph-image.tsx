import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "TriageMail · Emily — AI Mail Triage Agent"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

/**
 * OG image dinámica. Se sirve en /opengraph-image y Next.js la inyecta
 * automáticamente en <meta property="og:image"> + twitter:image.
 *
 * Vercel hackathon showcase, LinkedIn, X, Slack, etc. la usarán como
 * thumbnail del repo / del link.
 */
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          background:
            "linear-gradient(135deg, #0A0A0B 0%, #14141A 50%, #1A1A24 100%)",
          color: "#EDEDED",
          padding: "70px 80px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Decorative glow blob top-right */}
        <div
          style={{
            position: "absolute",
            top: -200,
            right: -200,
            width: 600,
            height: 600,
            borderRadius: 600,
            background:
              "radial-gradient(circle, rgba(124,122,237,0.18) 0%, rgba(124,122,237,0) 70%)",
            display: "flex",
          }}
        />

        {/* Left: Emily avatar grande */}
        <div
          style={{
            width: 280,
            height: 280,
            borderRadius: 64,
            background: "#7C7AED",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 64,
            flexShrink: 0,
            boxShadow: "0 30px 80px rgba(124,122,237,0.35)",
          }}
        >
          <svg width="220" height="220" viewBox="0 0 32 32" fill="none">
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
            <rect x="14.4" y="22.5" width="3.2" height="3" rx="0.6" fill="white" />
            {/* Lentes */}
            <g stroke="#0A0A0B" strokeWidth="0.85" fill="none">
              <circle cx="13.8" cy="17.6" r="1.9" />
              <circle cx="18.2" cy="17.6" r="1.9" />
              <line
                x1="15.7"
                y1="17.6"
                x2="16.3"
                y2="17.6"
                strokeLinecap="round"
              />
              <line
                x1="11.9"
                y1="17.55"
                x2="11"
                y2="17.4"
                strokeLinecap="round"
              />
              <line
                x1="20.1"
                y1="17.55"
                x2="21"
                y2="17.4"
                strokeLinecap="round"
              />
            </g>
            {/* Ojos */}
            <circle cx="13.8" cy="17.6" r="0.72" fill="#0A0A0B" />
            <circle cx="18.2" cy="17.6" r="0.72" fill="#0A0A0B" />
            {/* Sonrisa */}
            <path
              d="M14.3 21.2 Q16 22.2 17.7 21.2"
              stroke="#0A0A0B"
              strokeWidth="0.7"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>

        {/* Right: copy */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 18,
              color: "#9794FF",
              letterSpacing: "0.18em",
              fontWeight: 700,
              marginBottom: 18,
              display: "flex",
            }}
          >
            TRIAGEMAIL · AI-POWERED MAIL TRIAGE AGENT
          </div>
          <div
            style={{
              fontSize: 110,
              fontWeight: 800,
              lineHeight: 1,
              marginBottom: 30,
              display: "flex",
              color: "white",
              letterSpacing: "-0.02em",
            }}
          >
            Hola, soy Emily.
          </div>
          <div
            style={{
              fontSize: 32,
              lineHeight: 1.35,
              color: "#EDEDED",
              opacity: 0.88,
              maxWidth: 680,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>Me llevo tu inbox los sábados.</span>
            <span style={{ marginTop: 6, color: "#8A8A8A" }}>
              Tú apruebas. Yo nunca envío sola.
            </span>
          </div>
          <div
            style={{
              marginTop: 44,
              display: "flex",
              gap: 18,
              alignItems: "center",
              fontSize: 20,
              fontWeight: 600,
            }}
          >
            <span style={{ color: "#7C7AED" }}>Vercel Zero to Agent</span>
            <span style={{ color: "#3A3A45" }}>·</span>
            <span style={{ color: "#9A9A9A" }}>Track 2 — v0 + MCPs</span>
            <span style={{ color: "#3A3A45" }}>·</span>
            <span style={{ color: "#9A9A9A" }}>#ZeroToAgent</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
