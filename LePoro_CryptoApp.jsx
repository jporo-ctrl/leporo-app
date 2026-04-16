import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════
   LE'PORO CRYPTO TRADING APP
   Complete production-ready build
   AI-powered · Multi-user · Full investment platform
═══════════════════════════════════════════════════════════ */

// ── Google Fonts ─────────────────────────────────────────────────────────────
const FontLink = () => (
  <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garant:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=IBM+Plex+Mono:wght@300;400;500;600&family=Outfit:wght@300;400;500;600;700&display=swap');`}</style>
);

// ── Design Tokens ─────────────────────────────────────────────────────────────
const T = {
  bg:         "#070F09",
  surface:    "#0C1810",
  card:       "#101E13",
  cardHover:  "#152219",
  border:     "#1A2E1E",
  borderHi:   "#2A4A2E",
  emerald:    "#00C853",
  emeraldDim: "#005224",
  emeraldFog: "rgba(0,200,83,0.10)",
  champagne:  "#F0DEB4",
  chamDim:    "#7A6A3A",
  copper:     "#C8822A",
  copperDim:  "#5C3A10",
  copperFog:  "rgba(200,130,42,0.12)",
  text:       "#EEE8DA",
  muted:      "#607060",
  subtle:     "#1A2E1E",
  red:        "#FF4560",
  redFog:     "rgba(255,69,96,0.12)",
  blue:       "#29B6F6",
  yellow:     "#FFD740",
  white:      "#FFFFFF",
};

const F = {
  display: "'Cormorant Garant', Georgia, serif",
  mono:    "'IBM Plex Mono', 'Courier New', monospace",
  ui:      "'Outfit', system-ui, sans-serif",
};

// ── Formatters ────────────────────────────────────────────────────────────────
const fmt   = (n, d = 2) => Number(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtUSD = (n) => `$${fmt(n)}`;
const fmtK   = (n) => n >= 1000 ? `$${fmt(n / 1000, 1)}k` : fmtUSD(n);
const clamp  = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// ── Mock Data ─────────────────────────────────────────────────────────────────
const MOCK_USER = {
  name:        "Joshua Mwangi",
  email:       "joshua@leporo.app",
  phone:       "+234 801 234 5678",
  joined:      "January 2025",
  tier:        "Growth",
  avatar:      "JM",
  kycVerified: true,
  twoFA:       true,
  riskLevel:   "Moderate",
  notifications: { trades: true, deposits: true, news: false, weekly: true },
};

const MOCK_PORTFOLIO = {
  totalValue:         52318.40,
  deposited:          42000,
  pnl:                10318.40,
  pnlPct:             24.57,
  availableWithdraw:  14200.00,
  aiStatus:           "ACTIVE",
  riskLevel:          "MODERATE",
  trades24h:          17,
  winRate:            71.2,
  bestTrade:          1240.80,
  worstTrade:         -312.40,
  allTimeDeposits:    42000,
  allTimeWithdrawals: 8000,
};

const COINS = [
  { coin:"BTC", name:"Bitcoin",   amount:0.934, value:35821.60, change:2.84,  color:"#F7931A", icon:"₿" },
  { coin:"ETH", name:"Ethereum",  amount:3.82,  value:11163.44, change:-0.92, color:"#627EEA", icon:"Ξ" },
  { coin:"SOL", name:"Solana",    amount:29.5,  value:3143.68,  change:6.14,  color:"#9945FF", icon:"◎" },
  { coin:"BNB", name:"BNB",       amount:4.1,   value:1421.80,  change:1.32,  color:"#F3BA2F", icon:"◈" },
  { coin:"ADA", name:"Cardano",   amount:1240,  value:767.88,   change:-2.11, color:"#0033AD", icon:"₳" },
];

const TRADES = [
  { id:1,  pair:"BTC/USDT",  type:"BUY",  amount:0.15, price:37840, pnl:618.20,  time:"4m ago",  reason:"RSI oversold at 28 + bullish divergence on 4H. Strong support at $37.5K confirmed by volume profile." },
  { id:2,  pair:"SOL/USDT",  type:"BUY",  amount:18,   price:104.8, pnl:441.00,  time:"22m ago", reason:"Breakout from 3-week descending wedge. Volume 340% above 20-day average. Momentum aligned." },
  { id:3,  pair:"ETH/USDT",  type:"SELL", amount:1.2,  price:2920,  pnl:-182.40, time:"1h ago",  reason:"MACD bearish crossover on 1H. Funding rate flipped negative. Risk governor triggered partial exit." },
  { id:4,  pair:"BTC/USDT",  type:"SELL", amount:0.08, price:38200, pnl:296.00,  time:"3h ago",  reason:"Take-profit at $38.2K resistance. Locked in 2.8% gain. Waiting for retest of $37.8K for re-entry." },
  { id:5,  pair:"BNB/USDT",  type:"BUY",  amount:3.5,  price:344.8, pnl:82.25,   time:"5h ago",  reason:"Accumulation pattern identified over 72 hours. Smart money inflow detected via on-chain analysis." },
  { id:6,  pair:"ADA/USDT",  type:"BUY",  amount:800,  price:0.612, pnl:38.40,   time:"8h ago",  reason:"Oversold bounce setup. RSI 24 on daily. Low-risk entry with tight stop at $0.598." },
  { id:7,  pair:"SOL/USDT",  type:"SELL", amount:12,   price:108.4, pnl:220.80,  time:"11h ago", reason:"Profit-take at local resistance. Maintained 60% of SOL position. Trailing stop updated." },
  { id:8,  pair:"ETH/USDT",  type:"BUY",  amount:0.9,  price:2885,  pnl:166.50,  time:"14h ago", reason:"Golden cross forming on 4H chart. Gas fees declining — historically bullish signal." },
];

const PNL_HISTORY = [42000,42180,41900,42600,43400,43100,44200,44800,43900,45600,46800,46200,47800,49100,48600,50400,51200,52318];

const MARKET_TICKERS = [
  { coin:"BTC",  price:38412.80, change:2.84  },
  { coin:"ETH",  price:2924.50,  change:-0.92 },
  { coin:"SOL",  price:106.55,   change:6.14  },
  { coin:"BNB",  price:346.20,   change:1.32  },
  { coin:"XRP",  price:0.5841,   change:-1.44 },
  { coin:"DOGE", price:0.1182,   change:3.21  },
  { coin:"ADA",  price:0.6194,   change:-2.11 },
  { coin:"AVAX", price:38.74,    change:4.02  },
];

const NOTIFICATIONS = [
  { id:1, type:"trade",   icon:"🤖", title:"AI executed BUY — BTC",    body:"Bought 0.15 BTC at $37,840. Estimated profit zone: $38.4K.",   time:"4m ago",  read:false },
  { id:2, type:"trade",   icon:"🤖", title:"AI executed BUY — SOL",    body:"Bought 18 SOL at $104.80. Breakout confirmed.",                time:"22m ago", read:false },
  { id:3, type:"trade",   icon:"🤖", title:"AI executed SELL — ETH",   body:"Sold 1.2 ETH at $2,920. Risk governor triggered partial exit.",time:"1h ago",  read:true  },
  { id:4, type:"deposit", icon:"✅", title:"Deposit confirmed",         body:"$5,000 via bank transfer has been credited to your account.", time:"2h ago",  read:true  },
  { id:5, type:"info",    icon:"📊", title:"Weekly performance report", body:"Your portfolio grew 4.2% this week. AI win rate: 71.2%.",     time:"2d ago",  read:true  },
];

// ── Global CSS ────────────────────────────────────────────────────────────────
const GlobalCSS = () => (
  <style>{`
    *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }
    html,body,#root { background:${T.bg}; color:${T.text}; min-height:100vh; }
    input[type=number]::-webkit-inner-spin-button,
    input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none; }
    input[type=range] {
      -webkit-appearance:none; width:100%; height:4px;
      border-radius:2px; background:${T.border}; outline:none;
    }
    input[type=range]::-webkit-slider-thumb {
      -webkit-appearance:none; width:20px; height:20px;
      border-radius:50%; background:${T.copper}; cursor:pointer;
      box-shadow:0 0 8px ${T.copperFog};
    }
    button { font-family:${F.ui}; }
    ::-webkit-scrollbar { width:4px; }
    ::-webkit-scrollbar-track { background:transparent; }
    ::-webkit-scrollbar-thumb { background:${T.border}; border-radius:2px; }
    @keyframes pulse    { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.5)} }
    @keyframes fadeUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    @keyframes shimmer  { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
    @keyframes marquee  { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
    @keyframes spin     { to{transform:rotate(360deg)} }
    @keyframes glow     { 0%,100%{box-shadow:0 0 8px ${T.emeraldFog}} 50%{box-shadow:0 0 24px ${T.emeraldFog}} }
    .fade-up  { animation:fadeUp  0.4s ease forwards; }
    .card-hover:hover { background:${T.cardHover}!important; border-color:${T.borderHi}!important; }
  `}</style>
);

// ── Primitives ────────────────────────────────────────────────────────────────

const View = ({ children, style, className, onClick }) => (
  <div style={style} className={className} onClick={onClick}>{children}</div>
);

const Text = ({ children, style, mono, display }) => (
  <span style={{ fontFamily: display ? F.display : mono ? F.mono : F.ui, ...style }}>{children}</span>
);

function Card({ children, style, onClick, hover = true, glass }) {
  const base = {
    background: glass ? "rgba(12,24,16,0.7)" : T.card,
    border: `1px solid ${T.border}`,
    borderRadius: 18,
    padding: 20,
    transition: "all 0.2s ease",
    cursor: onClick ? "pointer" : "default",
    backdropFilter: glass ? "blur(20px)" : "none",
    ...style,
  };
  return (
    <div
      style={base}
      className={hover && onClick ? "card-hover" : ""}
      onClick={onClick}
    >{children}</div>
  );
}

function Btn({ children, onClick, variant = "primary", style, disabled, full, size = "md" }) {
  const sizes = { sm: "8px 16px", md: "14px 24px", lg: "17px 32px" };
  const fontSizes = { sm: 12, md: 14, lg: 16 };
  const variants = {
    primary:  { background: T.copper,   color: "#fff",   border: "none" },
    emerald:  { background: T.emerald,  color: "#fff",   border: "none" },
    ghost:    { background: "transparent", color: T.champagne, border: `1px solid ${T.border}` },
    danger:   { background: T.redFog,   color: T.red,    border: `1px solid ${T.red}44` },
    outline:  { background: "transparent", color: T.copper, border: `1px solid ${T.copper}` },
  };
  return (
    <button
      onClick={!disabled ? onClick : undefined}
      style={{
        ...variants[variant],
        padding: sizes[size],
        borderRadius: 12,
        fontSize: fontSizes[size],
        fontWeight: 600,
        letterSpacing: 0.3,
        cursor: disabled ? "not-allowed" : "pointer",
        width: full ? "100%" : "auto",
        opacity: disabled ? 0.45 : 1,
        transition: "all 0.2s",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        ...style,
      }}
    >{children}</button>
  );
}

function Badge({ children, color = T.emerald, bg }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 20,
      background: bg || `${color}18`, border: `1px solid ${color}40`,
      color, fontSize: 10, fontWeight: 700, letterSpacing: 1.2,
      fontFamily: F.mono,
    }}>{children}</span>
  );
}

function Dot({ color, pulse }) {
  return (
    <span style={{
      width: 7, height: 7, borderRadius: "50%", background: color,
      display: "inline-block", flexShrink: 0,
      animation: pulse ? "pulse 1.6s ease infinite" : "none",
    }} />
  );
}

function Divider() {
  return <div style={{ height: 1, background: T.border, margin: "4px 0" }} />;
}

function Label({ children }) {
  return (
    <div style={{ fontFamily: F.mono, fontSize: 10, color: T.muted, letterSpacing: 1.8, marginBottom: 10, fontWeight: 500 }}>{children}</div>
  );
}

// ── Sparkline ─────────────────────────────────────────────────────────────────
function Sparkline({ data, color = T.copper, height = 48, width = 200 }) {
  const min = Math.min(...data), max = Math.max(...data);
  const xScale = (i) => (i / (data.length - 1)) * width;
  const yScale = (v) => height - ((v - min) / (max - min || 1)) * height;
  const pts = data.map((v, i) => `${xScale(i)},${yScale(v)}`).join(" ");
  const areaClose = `L${width},${height} L0,${height} Z`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id={`sg-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M${pts.split(" ").map(p => `${p}`).join(" L")} ${areaClose}`}
        fill={`url(#sg-${color.replace("#","")})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {/* Last point dot */}
      <circle
        cx={xScale(data.length - 1)}
        cy={yScale(data[data.length - 1])}
        r="3" fill={color}
      />
    </svg>
  );
}

// ── Mini Donut ────────────────────────────────────────────────────────────────
function MiniDonut({ data }) {
  const total = data.reduce((a, d) => a + d.value, 0);
  let acc = 0;
  const r = 44, cx = 50, cy = 50, stroke = 14;
  const segments = data.map(d => {
    const pct = d.value / total;
    const dash = pct * Math.PI * 2 * r;
    const gap = Math.PI * 2 * r - dash;
    const rotate = acc * 360;
    acc += pct;
    return { ...d, dash, gap, rotate };
  });
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" style={{ display:"block" }}>
      {segments.map((s, i) => (
        <circle
          key={i} cx={cx} cy={cy} r={r}
          fill="none" stroke={s.color} strokeWidth={stroke}
          strokeDasharray={`${s.dash} ${s.gap}`}
          strokeDashoffset={0}
          style={{ transformOrigin:"50px 50px", transform:`rotate(${s.rotate - 90}deg)` }}
        />
      ))}
      <circle cx={cx} cy={cy} r={r - stroke / 2 - 2} fill={T.card} />
    </svg>
  );
}

// ── Ticker Bar ────────────────────────────────────────────────────────────────
function TickerBar() {
  const items = [...MARKET_TICKERS, ...MARKET_TICKERS];
  return (
    <div style={{ overflow:"hidden", background: T.surface, borderBottom:`1px solid ${T.border}`, padding:"8px 0" }}>
      <div style={{
        display:"flex", gap:32, whiteSpace:"nowrap",
        animation:"marquee 22s linear infinite",
        width:"max-content",
      }}>
        {items.map((t, i) => (
          <span key={i} style={{ fontFamily:F.mono, fontSize:11, display:"inline-flex", gap:8, alignItems:"center" }}>
            <span style={{ color:T.muted }}>{t.coin}</span>
            <span style={{ color:T.text, fontWeight:500 }}>{t.coin === "XRP" || t.coin === "DOGE" || t.coin === "ADA" ? `$${t.price}` : fmtUSD(t.price)}</span>
            <span style={{ color: t.change >= 0 ? T.emerald : T.red, fontSize:10 }}>
              {t.change >= 0 ? "▲" : "▼"} {Math.abs(t.change)}%
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Header ────────────────────────────────────────────────────────────────────
function Header({ title, subtitle, onBack, right, ticker }) {
  return (
    <>
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"20px 20px 16px",
        position:"sticky", top:0, zIndex:50,
        backdropFilter:"blur(24px)",
        background:"rgba(7,15,9,0.88)",
        borderBottom:`1px solid ${T.border}`,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          {onBack && (
            <button onClick={onBack} style={{
              width:36, height:36, borderRadius:10,
              background:T.surface, border:`1px solid ${T.border}`,
              color:T.text, cursor:"pointer", fontSize:16,
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>←</button>
          )}
          <div>
            <div style={{ fontFamily:F.display, fontSize:20, fontWeight:700, lineHeight:1.1, color:T.champagne }}>{title}</div>
            {subtitle && <div style={{ fontFamily:F.mono, fontSize:10, color:T.muted, marginTop:3, letterSpacing:1 }}>{subtitle}</div>}
          </div>
        </div>
        {right}
      </div>
      {ticker && <TickerBar />}
    </>
  );
}

// ── Screen Wrapper ────────────────────────────────────────────────────────────
function Screen({ children, pad = true }) {
  return (
    <div style={{
      minHeight:"100vh",
      paddingBottom:86,
      background:T.bg,
    }}>
      <div style={{ padding: pad ? "0 20px" : 0 }}>{children}</div>
    </div>
  );
}

// ── Bottom Nav ────────────────────────────────────────────────────────────────
function BottomNav({ active, onNav, unread }) {
  const items = [
    { id:"dashboard",  icon:"⌂",  label:"Home"      },
    { id:"portfolio",  icon:"◉",  label:"Portfolio"  },
    { id:"trades",     icon:"⟷",  label:"Trades"     },
    { id:"ai",         icon:"✦",  label:"AI"         },
    { id:"settings",   icon:"⚙",  label:"Account"    },
  ];
  return (
    <nav style={{
      position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)",
      width:"100%", maxWidth:480, zIndex:100,
      background:"rgba(10,16,11,0.96)", backdropFilter:"blur(24px)",
      borderTop:`1px solid ${T.border}`,
      display:"flex", justifyContent:"space-around",
      padding:"10px 0 16px",
    }}>
      {items.map(it => {
        const on = active === it.id;
        return (
          <button key={it.id} onClick={() => onNav(it.id)} style={{
            display:"flex", flexDirection:"column", alignItems:"center", gap:4,
            background:"none", border:"none", cursor:"pointer",
            padding:"4px 12px", borderRadius:10, position:"relative",
            color: on ? T.copper : T.muted,
            transition:"color 0.2s",
          }}>
            <span style={{ fontSize:20, lineHeight:1 }}>{it.icon}</span>
            <span style={{ fontFamily:F.ui, fontSize:9, letterSpacing:0.8, fontWeight: on ? 600 : 400 }}>{it.label}</span>
            {it.id === "settings" && unread > 0 && (
              <span style={{
                position:"absolute", top:2, right:8,
                width:8, height:8, borderRadius:"50%",
                background:T.red, border:`2px solid ${T.bg}`,
              }} />
            )}
            {on && (
              <span style={{
                position:"absolute", bottom:-6, width:20, height:2,
                borderRadius:1, background:T.copper,
              }} />
            )}
          </button>
        );
      })}
    </nav>
  );
}

// ═══════════════════════════════════════════════════════════
//   SCREEN: SPLASH / ONBOARDING
// ═══════════════════════════════════════════════════════════
function SplashScreen({ onContinue }) {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ name:"", email:"", password:"", phone:"", confirm:"" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.email.includes("@")) e.email = "Enter a valid email";
    if (form.password.length < 6)  e.password = "Minimum 6 characters";
    if (tab === "signup") {
      if (!form.name.trim())             e.name = "Name is required";
      if (form.confirm !== form.password) e.confirm = "Passwords do not match";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); onContinue(); }, 1400);
  };

  const inputStyle = (err) => ({
    width:"100%", padding:"14px 16px",
    background:T.surface, border:`1px solid ${err ? T.red : T.border}`,
    borderRadius:12, color:T.text, fontFamily:F.ui, fontSize:14, outline:"none",
    transition:"border-color 0.2s",
  });

  return (
    <div style={{
      minHeight:"100vh", background:T.bg,
      display:"flex", flexDirection:"column",
    }}>
      {/* Hero */}
      <div style={{
        flex:1, display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        padding:"48px 32px 32px",
        background:`radial-gradient(ellipse 60% 40% at 50% 0%, ${T.emeraldFog}, transparent)`,
      }}>
        {/* Logo mark */}
        <div style={{
          width:72, height:72, borderRadius:20,
          background:`linear-gradient(135deg, ${T.copper}, ${T.copperDim})`,
          display:"flex", alignItems:"center", justifyContent:"center",
          marginBottom:20, boxShadow:`0 0 40px ${T.copperFog}`,
          fontSize:32, fontFamily:F.display, fontWeight:700, color:"#fff",
          animation:"glow 3s ease infinite",
        }}>₡</div>
        <div style={{ fontFamily:F.display, fontSize:38, fontWeight:700, color:T.champagne, textAlign:"center", lineHeight:1.1 }}>
          Le'Poro
        </div>
        <div style={{ fontFamily:F.mono, fontSize:11, color:T.muted, letterSpacing:2.5, marginTop:8, textAlign:"center" }}>
          AI-POWERED CRYPTO TRADING
        </div>
        <div style={{ fontFamily:F.ui, fontSize:13, color:T.muted, marginTop:16, textAlign:"center", maxWidth:260, lineHeight:1.6 }}>
          Deposit capital. Let our AI trade for you. Withdraw profits anytime.
        </div>
        {/* Stats row */}
        <div style={{ display:"flex", gap:24, marginTop:28 }}>
          {[["$2.4M+","Managed"],["71%","Win Rate"],["3K+","Users"]].map(([v,l]) => (
            <div key={l} style={{ textAlign:"center" }}>
              <div style={{ fontFamily:F.display, fontSize:22, fontWeight:700, color:T.copper }}>{v}</div>
              <div style={{ fontFamily:F.mono, fontSize:9, color:T.muted, letterSpacing:1, marginTop:2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Auth card */}
      <div style={{
        background:T.surface, borderTop:`1px solid ${T.border}`,
        borderRadius:"24px 24px 0 0", padding:"24px 24px 40px",
      }}>
        {/* Tabs */}
        <div style={{ display:"flex", background:T.card, borderRadius:12, padding:4, marginBottom:22, border:`1px solid ${T.border}` }}>
          {["login","signup"].map(t => (
            <button key={t} onClick={() => { setTab(t); setErrors({}); }} style={{
              flex:1, padding:"10px", borderRadius:9, fontFamily:F.ui,
              fontSize:13, fontWeight:600, cursor:"pointer", border:"none",
              background: tab === t ? T.copper : "transparent",
              color: tab === t ? "#fff" : T.muted,
              transition:"all 0.2s",
            }}>{t === "login" ? "Sign In" : "Create Account"}</button>
          ))}
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {tab === "signup" && (
            <div>
              <input placeholder="Full Name" value={form.name} onChange={e => set("name", e.target.value)}
                style={inputStyle(errors.name)} />
              {errors.name && <div style={{ color:T.red, fontSize:11, marginTop:4 }}>{errors.name}</div>}
            </div>
          )}
          <div>
            <input type="email" placeholder="Email address" value={form.email} onChange={e => set("email", e.target.value)}
              style={inputStyle(errors.email)} />
            {errors.email && <div style={{ color:T.red, fontSize:11, marginTop:4 }}>{errors.email}</div>}
          </div>
          <div>
            <input type="password" placeholder="Password" value={form.password} onChange={e => set("password", e.target.value)}
              style={inputStyle(errors.password)} />
            {errors.password && <div style={{ color:T.red, fontSize:11, marginTop:4 }}>{errors.password}</div>}
          </div>
          {tab === "signup" && (
            <div>
              <input type="password" placeholder="Confirm Password" value={form.confirm} onChange={e => set("confirm", e.target.value)}
                style={inputStyle(errors.confirm)} />
              {errors.confirm && <div style={{ color:T.red, fontSize:11, marginTop:4 }}>{errors.confirm}</div>}
            </div>
          )}
        </div>

        {tab === "login" && (
          <div style={{ textAlign:"right", marginTop:6 }}>
            <span style={{ fontFamily:F.ui, fontSize:12, color:T.copper, cursor:"pointer" }}>Forgot password?</span>
          </div>
        )}

        <Btn
          variant="primary" full size="lg"
          onClick={handleSubmit}
          style={{ marginTop:20, background: loading ? T.copperDim : T.copper }}
        >
          {loading ? (
            <span style={{ display:"inline-block", width:18, height:18, border:`2px solid #fff4`, borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
          ) : tab === "login" ? "Sign In to Le'Poro" : "Create My Account"}
        </Btn>

        {tab === "signup" && (
          <p style={{ fontFamily:F.ui, fontSize:11, color:T.muted, textAlign:"center", marginTop:14, lineHeight:1.6 }}>
            By creating an account you agree to our{" "}
            <span style={{ color:T.copper }}>Terms of Service</span> and{" "}
            <span style={{ color:T.copper }}>Privacy Policy</span>.
          </p>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//   SCREEN: DASHBOARD
// ═══════════════════════════════════════════════════════════
function Dashboard({ onNav, onNotif }) {
  const p = MOCK_PORTFOLIO;
  const u = MOCK_USER;
  const unread = NOTIFICATIONS.filter(n => !n.read).length;

  return (
    <div style={{ minHeight:"100vh", paddingBottom:86, background:T.bg }}>
      {/* Top bar */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"20px 20px 14px",
        position:"sticky", top:0, zIndex:50,
        backdropFilter:"blur(24px)",
        background:"rgba(7,15,9,0.88)",
        borderBottom:`1px solid ${T.border}`,
      }}>
        <div>
          <div style={{ fontFamily:F.mono, fontSize:10, color:T.muted, letterSpacing:2 }}>LE'PORO</div>
          <div style={{ fontFamily:F.display, fontSize:22, fontWeight:700, color:T.champagne, marginTop:2 }}>
            Good day, {u.name.split(" ")[0]} 👋
          </div>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <Badge color={T.emerald}><Dot color={T.emerald} pulse />AI LIVE</Badge>
          <button onClick={onNotif} style={{
            width:38, height:38, borderRadius:10, position:"relative",
            background:T.surface, border:`1px solid ${T.border}`,
            color:T.text, cursor:"pointer", fontSize:16,
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            🔔
            {unread > 0 && (
              <span style={{
                position:"absolute", top:4, right:4,
                width:16, height:16, borderRadius:"50%",
                background:T.red, color:"#fff",
                fontSize:9, fontWeight:700, fontFamily:F.mono,
                display:"flex", alignItems:"center", justifyContent:"center",
                border:`2px solid ${T.bg}`,
              }}>{unread}</span>
            )}
          </button>
          <div style={{
            width:38, height:38, borderRadius:10,
            background:`linear-gradient(135deg, ${T.copper}, ${T.copperDim})`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontFamily:F.display, fontSize:14, fontWeight:700, color:"#fff",
            cursor:"pointer",
          }} onClick={() => onNav("settings")}>{u.avatar}</div>
        </div>
      </div>
      <TickerBar />

      <div style={{ padding:"20px 20px 0" }}>

        {/* Portfolio Hero */}
        <Card style={{
          background:`linear-gradient(145deg, #0C1E0F, #091508)`,
          border:`1px solid ${T.emeraldDim}`,
          position:"relative", overflow:"hidden", marginBottom:16,
        }}>
          <div style={{
            position:"absolute", top:-60, right:-60, width:180, height:180, borderRadius:"50%",
            background:`radial-gradient(circle, ${T.copper}18, transparent 70%)`,
          }} />
          <div style={{ position:"absolute", bottom:-40, left:-40, width:140, height:140, borderRadius:"50%",
            background:`radial-gradient(circle, ${T.emerald}0A, transparent 70%)` }} />

          <div style={{ fontFamily:F.mono, fontSize:10, color:T.muted, letterSpacing:2, marginBottom:10 }}>TOTAL PORTFOLIO VALUE</div>
          <div style={{ fontFamily:F.display, fontSize:42, fontWeight:700, color:T.champagne, letterSpacing:-1 }}>
            {fmtUSD(p.totalValue)}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:6 }}>
            <Badge color={T.emerald}>▲ +{fmtUSD(p.pnl)}</Badge>
            <span style={{ fontFamily:F.mono, fontSize:12, color:T.emerald }}>+{p.pnlPct}% all time</span>
          </div>

          {/* Sparkline */}
          <div style={{ marginTop:18, marginLeft:-4 }}>
            <Sparkline data={PNL_HISTORY} color={T.copper} height={52} width={320} />
          </div>

          {/* Row stats */}
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:18, borderTop:`1px solid ${T.border}`, paddingTop:16 }}>
            {[
              { l:"DEPOSITED",    v: fmtUSD(p.deposited),        c: T.text },
              { l:"PROFIT",       v: fmtUSD(p.pnl),              c: T.emerald },
              { l:"WITHDRAWABLE", v: fmtUSD(p.availableWithdraw), c: T.copper },
            ].map(s => (
              <div key={s.l}>
                <div style={{ fontFamily:F.mono, fontSize:9, color:T.muted, letterSpacing:1.2, marginBottom:4 }}>{s.l}</div>
                <div style={{ fontFamily:F.mono, fontSize:14, fontWeight:600, color:s.c }}>{s.v}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick actions */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:16 }}>
          {[
            { label:"Deposit",  icon:"↓", color:T.emerald, screen:"deposit"  },
            { label:"Withdraw", icon:"↑", color:T.copper,  screen:"withdraw" },
            { label:"Trades",   icon:"⟷", color:T.blue,    screen:"trades"   },
          ].map(a => (
            <button key={a.label} onClick={() => onNav(a.screen)} style={{
              background:T.card, border:`1px solid ${T.border}`,
              borderRadius:14, padding:"14px 8px",
              display:"flex", flexDirection:"column", alignItems:"center", gap:8,
              cursor:"pointer", transition:"all 0.2s", color:T.text,
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor=a.color; e.currentTarget.style.background=`${a.color}10`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor=T.border; e.currentTarget.style.background=T.card; }}
            >
              <div style={{ width:38, height:38, borderRadius:10, background:`${a.color}18`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, color:a.color }}>{a.icon}</div>
              <span style={{ fontFamily:F.ui, fontSize:11, fontWeight:600, letterSpacing:0.3 }}>{a.label}</span>
            </button>
          ))}
        </div>

        {/* AI Performance */}
        <Card style={{ marginBottom:16 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <Label>AI PERFORMANCE · 24H</Label>
            <Btn size="sm" variant="ghost" onClick={() => onNav("ai")}>Analyze ›</Btn>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
            {[
              { l:"TRADES",   v:p.trades24h,  c:T.blue    },
              { l:"WIN RATE", v:`${p.winRate}%`, c:T.emerald },
              { l:"BEST",     v:`+${fmtK(p.bestTrade)}`, c:T.emerald },
              { l:"WORST",    v:fmtK(p.worstTrade), c:T.red },
            ].map(s => (
              <div key={s.l} style={{ textAlign:"center", padding:"10px 4px", background:T.surface, borderRadius:10, border:`1px solid ${T.border}` }}>
                <div style={{ fontFamily:F.mono, fontSize:15, fontWeight:600, color:s.c }}>{s.v}</div>
                <div style={{ fontFamily:F.mono, fontSize:8, color:T.muted, letterSpacing:1, marginTop:4 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Positions */}
        <div style={{ marginBottom:16 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <div style={{ fontFamily:F.display, fontSize:18, fontWeight:700, color:T.champagne }}>Open Positions</div>
            <Btn size="sm" variant="ghost" onClick={() => onNav("portfolio")}>View All ›</Btn>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {COINS.slice(0,3).map(pos => (
              <Card key={pos.coin} style={{ padding:"14px 16px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{
                      width:42, height:42, borderRadius:12,
                      background:`${pos.color}18`, border:`1px solid ${pos.color}40`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontFamily:F.mono, fontSize:14, fontWeight:700, color:pos.color,
                    }}>{pos.icon}</div>
                    <div>
                      <div style={{ fontFamily:F.ui, fontSize:14, fontWeight:600 }}>{pos.name}</div>
                      <div style={{ fontFamily:F.mono, fontSize:11, color:T.muted, marginTop:2 }}>{pos.amount} {pos.coin}</div>
                    </div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontFamily:F.mono, fontSize:14, fontWeight:600 }}>{fmtUSD(pos.value)}</div>
                    <div style={{ fontFamily:F.mono, fontSize:12, color: pos.change >= 0 ? T.emerald : T.red, marginTop:3 }}>
                      {pos.change >= 0 ? "▲" : "▼"} {Math.abs(pos.change)}%
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Trades */}
        <div style={{ marginBottom:16 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <div style={{ fontFamily:F.display, fontSize:18, fontWeight:700, color:T.champagne }}>Recent AI Trades</div>
            <Btn size="sm" variant="ghost" onClick={() => onNav("trades")}>See All ›</Btn>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {TRADES.slice(0,3).map(t => <TradeCard key={t.id} trade={t} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Trade Card ────────────────────────────────────────────────────────────────
function TradeCard({ trade: t }) {
  const buy = t.type === "BUY";
  const pos = t.pnl >= 0;
  return (
    <Card style={{ padding:"14px 16px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{
            padding:"3px 9px", borderRadius:6, fontFamily:F.mono, fontSize:10, fontWeight:600, letterSpacing:1,
            background: buy ? `${T.emerald}18` : `${T.red}18`,
            color: buy ? T.emerald : T.red,
            border: `1px solid ${buy ? T.emerald : T.red}44`,
          }}>{t.type}</span>
          <div>
            <div style={{ fontFamily:F.mono, fontSize:13, fontWeight:600 }}>{t.pair}</div>
            <div style={{ fontFamily:F.mono, fontSize:10, color:T.muted, marginTop:2 }}>{t.time} · {fmtUSD(t.price)}</div>
          </div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontFamily:F.mono, fontSize:13, fontWeight:600, color: pos ? T.emerald : T.red }}>
            {pos ? "+" : ""}{fmtUSD(t.pnl)}
          </div>
          <div style={{ fontFamily:F.mono, fontSize:10, color:T.muted, marginTop:2 }}>P&amp;L</div>
        </div>
      </div>
      <div style={{
        marginTop:10, padding:"8px 10px",
        background:T.surface, borderRadius:8,
        fontFamily:F.ui, fontSize:11, color:T.muted, lineHeight:1.5,
        display:"flex", gap:6, alignItems:"flex-start",
      }}>
        <span style={{ fontSize:12, flexShrink:0 }}>🤖</span>
        <span>{t.reason}</span>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════
//   SCREEN: PORTFOLIO
// ═══════════════════════════════════════════════════════════
function PortfolioScreen({ onBack }) {
  const total = COINS.reduce((a, c) => a + c.value, 0);
  return (
    <div style={{ minHeight:"100vh", paddingBottom:86, background:T.bg }}>
      <Header onBack={onBack} title="My Portfolio" subtitle="AI-MANAGED POSITIONS" />
      <div style={{ padding:"20px" }}>

        {/* Donut + legend */}
        <Card style={{ marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:20 }}>
            <MiniDonut data={COINS} />
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:F.mono, fontSize:10, color:T.muted, letterSpacing:1.5, marginBottom:8 }}>TOTAL INVESTED</div>
              <div style={{ fontFamily:F.display, fontSize:28, fontWeight:700, color:T.champagne }}>{fmtUSD(total)}</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"8px 16px", marginTop:14 }}>
                {COINS.map(c => (
                  <div key={c.coin} style={{ display:"flex", alignItems:"center", gap:5 }}>
                    <div style={{ width:8, height:8, borderRadius:2, background:c.color }} />
                    <span style={{ fontFamily:F.mono, fontSize:10, color:T.muted }}>{c.coin} {fmt(c.value/total*100,1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* All positions */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {COINS.map(pos => {
            const alloc = pos.value / total * 100;
            return (
              <Card key={pos.coin}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                    <div style={{
                      width:46, height:46, borderRadius:13,
                      background:`${pos.color}18`, border:`1px solid ${pos.color}40`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontFamily:F.mono, fontSize:16, fontWeight:700, color:pos.color,
                    }}>{pos.icon}</div>
                    <div>
                      <div style={{ fontFamily:F.ui, fontSize:15, fontWeight:600 }}>{pos.name}</div>
                      <div style={{ fontFamily:F.mono, fontSize:11, color:T.muted, marginTop:2 }}>{pos.amount} {pos.coin}</div>
                    </div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontFamily:F.mono, fontSize:15, fontWeight:600 }}>{fmtUSD(pos.value)}</div>
                    <div style={{ fontFamily:F.mono, fontSize:12, color: pos.change >= 0 ? T.emerald : T.red, marginTop:3 }}>
                      {pos.change >= 0 ? "▲" : "▼"} {Math.abs(pos.change)}%
                    </div>
                  </div>
                </div>
                {/* Allocation bar */}
                <div style={{ height:4, background:T.border, borderRadius:2, overflow:"hidden" }}>
                  <div style={{ width:`${alloc}%`, height:"100%", background:pos.color, borderRadius:2, transition:"width 0.6s ease" }} />
                </div>
                <div style={{ fontFamily:F.mono, fontSize:9, color:T.muted, marginTop:5 }}>{fmt(alloc,1)}% of portfolio</div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//   SCREEN: TRADE HISTORY
// ═══════════════════════════════════════════════════════════
function TradesScreen({ onBack }) {
  const [filter, setFilter] = useState("ALL");
  const filtered = filter === "ALL" ? TRADES : TRADES.filter(t => t.type === filter);
  const totalPnl  = TRADES.reduce((a, t) => a + t.pnl, 0);
  const wins      = TRADES.filter(t => t.pnl > 0).length;

  return (
    <div style={{ minHeight:"100vh", paddingBottom:86, background:T.bg }}>
      <Header onBack={onBack} title="AI Trade History" subtitle={`${TRADES.length} TRADES · ALL TIME`} />
      <div style={{ padding:"20px" }}>

        {/* Summary cards */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:16 }}>
          {[
            { l:"TOTAL P&L", v:fmtUSD(totalPnl), c: totalPnl >= 0 ? T.emerald : T.red },
            { l:"WIN RATE",  v:`${fmt(wins/TRADES.length*100,0)}%`, c:T.blue },
            { l:"TRADES",    v:TRADES.length, c:T.copper },
          ].map(s => (
            <Card key={s.l} style={{ padding:"14px 12px", textAlign:"center" }}>
              <div style={{ fontFamily:F.mono, fontSize:17, fontWeight:600, color:s.c }}>{s.v}</div>
              <div style={{ fontFamily:F.mono, fontSize:8, color:T.muted, letterSpacing:1, marginTop:5 }}>{s.l}</div>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display:"flex", gap:8, marginBottom:16 }}>
          {["ALL","BUY","SELL"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding:"8px 18px", borderRadius:20, fontFamily:F.ui, fontSize:12, fontWeight:600,
              background: filter===f ? T.copper : T.card,
              border: `1px solid ${filter===f ? T.copper : T.border}`,
              color: filter===f ? "#fff" : T.muted, cursor:"pointer", transition:"all 0.2s",
            }}>{f}</button>
          ))}
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {filtered.map(t => <TradeCard key={t.id} trade={t} />)}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//   SCREEN: DEPOSIT
// ═══════════════════════════════════════════════════════════
function DepositScreen({ onBack }) {
  const [step, setStep]     = useState(1); // 1=method, 2=amount, 3=confirm, 4=done
  const [method, setMethod] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const presets = [500,1000,2500,5000,10000];
  const fee = amount > 0 ? (method === "card" ? amount * 0.025 : amount * 0.005) : 0;

  const handleConfirm = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep(4); }, 1600);
  };

  if (step === 4) return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:32, gap:24 }}>
      <div style={{ width:80, height:80, borderRadius:"50%", background:`${T.emerald}18`, border:`2px solid ${T.emerald}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:36 }}>✓</div>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontFamily:F.display, fontSize:28, fontWeight:700, color:T.champagne }}>Deposit Submitted</div>
        <div style={{ fontFamily:F.ui, fontSize:14, color:T.muted, marginTop:8, lineHeight:1.6 }}>
          {fmtUSD(amount)} is being processed.<br />
          {method === "crypto" ? "Expected arrival: ~30 min" : "Expected arrival: 1–3 business days"}
        </div>
      </div>
      <Card style={{ width:"100%", maxWidth:380 }}>
        {[["Amount", fmtUSD(amount)],["Fee", fmtUSD(fee)],["Net Deposit", fmtUSD(amount - fee)],["Method", method === "bank" ? "Bank Transfer" : method === "card" ? "Debit/Credit Card" : "Crypto Wallet"],["Status","⏳ Pending"]].map(([k,v]) => (
          <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:`1px solid ${T.border}` }}>
            <span style={{ fontFamily:F.ui, fontSize:13, color:T.muted }}>{k}</span>
            <span style={{ fontFamily:F.mono, fontSize:13, fontWeight:600 }}>{v}</span>
          </div>
        ))}
      </Card>
      <Btn variant="primary" size="lg" onClick={onBack}>Back to Dashboard</Btn>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", paddingBottom:40, background:T.bg }}>
      <Header onBack={onBack} title="Deposit Funds" subtitle={`STEP ${step} OF 3`} />

      {/* Progress bar */}
      <div style={{ height:3, background:T.border }}>
        <div style={{ height:"100%", width:`${(step/3)*100}%`, background:T.copper, transition:"width 0.4s ease" }} />
      </div>

      <div style={{ padding:"24px 20px", display:"flex", flexDirection:"column", gap:20 }}>

        {/* Step 1: Method */}
        {step === 1 && (
          <>
            <div style={{ fontFamily:F.display, fontSize:22, fontWeight:700, color:T.champagne }}>Choose Payment Method</div>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {[
                { id:"bank",   icon:"🏦", label:"Bank Transfer",     note:"0.5% fee · 1–3 business days", recommend:true },
                { id:"card",   icon:"💳", label:"Debit / Credit Card", note:"2.5% fee · Instant"           },
                { id:"crypto", icon:"₿",  label:"Crypto Wallet",      note:"0% fee · ~30 minutes"         },
              ].map(m => (
                <button key={m.id} onClick={() => setMethod(m.id)} style={{
                  padding:"16px 18px", borderRadius:14,
                  background: method===m.id ? `${T.copper}14` : T.card,
                  border: `1px solid ${method===m.id ? T.copper : T.border}`,
                  cursor:"pointer", display:"flex", alignItems:"center", gap:14,
                  transition:"all 0.2s", textAlign:"left",
                }}>
                  <span style={{ fontSize:28 }}>{m.icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:F.ui, fontSize:14, fontWeight:600, color: method===m.id ? T.copper : T.text, display:"flex", gap:8, alignItems:"center" }}>
                      {m.label}
                      {m.recommend && <Badge color={T.emerald} bg={`${T.emerald}14`}>Recommended</Badge>}
                    </div>
                    <div style={{ fontFamily:F.mono, fontSize:11, color:T.muted, marginTop:4 }}>{m.note}</div>
                  </div>
                  <div style={{
                    width:20, height:20, borderRadius:"50%",
                    border:`2px solid ${method===m.id ? T.copper : T.border}`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    flexShrink:0,
                  }}>
                    {method===m.id && <div style={{ width:10, height:10, borderRadius:"50%", background:T.copper }} />}
                  </div>
                </button>
              ))}
            </div>
            <Btn variant="primary" full size="lg" disabled={!method} onClick={() => setStep(2)}>Continue →</Btn>
          </>
        )}

        {/* Step 2: Amount */}
        {step === 2 && (
          <>
            <div style={{ fontFamily:F.display, fontSize:22, fontWeight:700, color:T.champagne }}>Enter Amount</div>
            <div style={{ position:"relative" }}>
              <span style={{ position:"absolute", left:18, top:"50%", transform:"translateY(-50%)", fontFamily:F.mono, fontSize:24, color:T.muted }}>$</span>
              <input
                type="number" value={amount} onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                style={{
                  width:"100%", padding:"20px 18px 20px 40px",
                  background:T.card, border:`1px solid ${T.border}`, borderRadius:14,
                  color:T.champagne, fontFamily:F.mono, fontSize:28, outline:"none",
                  transition:"border-color 0.2s",
                }}
                onFocus={e => e.target.style.borderColor = T.copper}
                onBlur={e => e.target.style.borderColor = T.border}
              />
            </div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {presets.map(p => (
                <button key={p} onClick={() => setAmount(p)} style={{
                  padding:"7px 14px", borderRadius:20, fontFamily:F.mono, fontSize:12,
                  background: amount == p ? `${T.copper}20` : T.card,
                  border:`1px solid ${amount == p ? T.copper : T.border}`,
                  color: amount == p ? T.copper : T.muted, cursor:"pointer", transition:"all 0.2s",
                }}>{p >= 1000 ? `$${p/1000}k` : `$${p}`}</button>
              ))}
            </div>

            {amount > 0 && (
              <Card style={{ background:T.surface }}>
                <Label>DEPOSIT SUMMARY</Label>
                {[
                  ["Amount", fmtUSD(amount)],
                  ["Processing Fee", fmtUSD(fee)],
                  ["You Receive", fmtUSD(amount - fee)],
                  ["Method", method === "bank" ? "Bank Transfer" : method === "card" ? "Card" : "Crypto"],
                ].map(([k,v]) => (
                  <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${T.border}` }}>
                    <span style={{ fontFamily:F.ui, fontSize:13, color:T.muted }}>{k}</span>
                    <span style={{ fontFamily:F.mono, fontSize:13, fontWeight:600, color: k==="You Receive" ? T.emerald : T.text }}>{v}</span>
                  </div>
                ))}
              </Card>
            )}

            <div style={{ padding:"12px 16px", borderRadius:10, background:`${T.blue}0F`, border:`1px solid ${T.blue}30`, fontFamily:F.ui, fontSize:12, color:T.blue, lineHeight:1.6 }}>
              🔒 Funds are held in a regulated custodial account and automatically deployed by Le'Poro AI upon clearing.
            </div>

            <div style={{ display:"flex", gap:10 }}>
              <Btn variant="ghost" onClick={() => setStep(1)} style={{ flex:1 }}>← Back</Btn>
              <Btn variant="primary" onClick={() => setStep(3)} disabled={!amount || amount <= 0} style={{ flex:2 }}>Review →</Btn>
            </div>
          </>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <>
            <div style={{ fontFamily:F.display, fontSize:22, fontWeight:700, color:T.champagne }}>Confirm Deposit</div>
            <Card style={{ background:T.surface }}>
              <div style={{ textAlign:"center", marginBottom:16 }}>
                <div style={{ fontFamily:F.mono, fontSize:11, color:T.muted, letterSpacing:1.5, marginBottom:6 }}>YOU ARE DEPOSITING</div>
                <div style={{ fontFamily:F.display, fontSize:40, fontWeight:700, color:T.champagne }}>{fmtUSD(amount)}</div>
              </div>
              {[
                ["Method",      method === "bank" ? "Bank Transfer" : method === "card" ? "Card" : "Crypto"],
                ["Fee",         fmtUSD(fee)],
                ["Net Deposit", fmtUSD(amount - fee)],
                ["Account",     MOCK_USER.email],
                ["Arrival",     method === "crypto" ? "~30 minutes" : "1–3 business days"],
              ].map(([k,v]) => (
                <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:`1px solid ${T.border}` }}>
                  <span style={{ fontFamily:F.ui, fontSize:13, color:T.muted }}>{k}</span>
                  <span style={{ fontFamily:F.mono, fontSize:13, fontWeight:600 }}>{v}</span>
                </div>
              ))}
            </Card>
            <div style={{ display:"flex", gap:10 }}>
              <Btn variant="ghost" onClick={() => setStep(2)} style={{ flex:1 }}>← Edit</Btn>
              <Btn variant="emerald" onClick={handleConfirm} style={{ flex:2 }} disabled={loading}>
                {loading
                  ? <span style={{ width:18, height:18, border:`2px solid #fff4`, borderTopColor:"#fff", borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite" }} />
                  : "✓ Confirm Deposit"}
              </Btn>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//   SCREEN: WITHDRAW
// ═══════════════════════════════════════════════════════════
function WithdrawScreen({ onBack }) {
  const max = MOCK_PORTFOLIO.availableWithdraw;
  const [amount, setAmount]   = useState("");
  const [dest, setDest]       = useState("bank");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const fee = amount > 0 ? amount * 0.002 : 0;

  const handleWithdraw = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setDone(true); }, 1600);
  };

  if (done) return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:32, gap:24 }}>
      <div style={{ width:80, height:80, borderRadius:"50%", background:`${T.copper}18`, border:`2px solid ${T.copper}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:36 }}>↑</div>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontFamily:F.display, fontSize:28, fontWeight:700, color:T.champagne }}>Withdrawal Requested</div>
        <div style={{ fontFamily:F.ui, fontSize:14, color:T.muted, marginTop:8, lineHeight:1.6 }}>
          {fmtUSD(amount - fee)} is on its way to your {dest === "bank" ? "bank account" : "crypto wallet"}.
        </div>
      </div>
      <Btn variant="primary" size="lg" onClick={onBack}>Back to Dashboard</Btn>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", paddingBottom:40, background:T.bg }}>
      <Header onBack={onBack} title="Withdraw Profits" subtitle={`AVAILABLE: ${fmtUSD(max)}`} />

      <div style={{ padding:"24px 20px", display:"flex", flexDirection:"column", gap:20 }}>

        {/* Balance hero */}
        <Card style={{ background:`linear-gradient(135deg, #0C1E0F, #091508)`, border:`1px solid ${T.emeraldDim}`, textAlign:"center", padding:28 }}>
          <div style={{ fontFamily:F.mono, fontSize:10, color:T.muted, letterSpacing:2, marginBottom:6 }}>AVAILABLE TO WITHDRAW</div>
          <div style={{ fontFamily:F.display, fontSize:40, fontWeight:700, color:T.emerald }}>{fmtUSD(max)}</div>
          <div style={{ fontFamily:F.mono, fontSize:11, color:T.muted, marginTop:6 }}>
            Portfolio total: {fmtUSD(MOCK_PORTFOLIO.totalValue)}
          </div>
        </Card>

        {/* Destination */}
        <div>
          <Label>WITHDRAW TO</Label>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {[
              { id:"bank",   icon:"🏦", label:"Bank Account",   note:"0.2% fee · 1–3 days" },
              { id:"crypto", icon:"🔑", label:"Crypto Wallet",  note:"0.2% fee · ~30 min"  },
            ].map(d => (
              <button key={d.id} onClick={() => setDest(d.id)} style={{
                padding:"16px 12px", borderRadius:14,
                background: dest===d.id ? `${T.copper}14` : T.card,
                border:`1px solid ${dest===d.id ? T.copper : T.border}`,
                cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:6, transition:"all 0.2s",
              }}>
                <span style={{ fontSize:26 }}>{d.icon}</span>
                <span style={{ fontFamily:F.ui, fontSize:12, fontWeight:700, color: dest===d.id ? T.copper : T.text }}>{d.label}</span>
                <span style={{ fontFamily:F.mono, fontSize:10, color:T.muted }}>{d.note}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Crypto address field */}
        {dest === "crypto" && (
          <div>
            <Label>WALLET ADDRESS</Label>
            <input
              placeholder="Enter your crypto wallet address"
              value={address}
              onChange={e => setAddress(e.target.value)}
              style={{
                width:"100%", padding:"14px 16px",
                background:T.card, border:`1px solid ${T.border}`, borderRadius:12,
                color:T.text, fontFamily:F.mono, fontSize:12, outline:"none",
              }}
              onFocus={e => e.target.style.borderColor = T.copper}
              onBlur={e => e.target.style.borderColor = T.border}
            />
          </div>
        )}

        {/* Amount */}
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
            <Label>AMOUNT (USD)</Label>
            <button onClick={() => setAmount(max)} style={{ fontFamily:F.mono, fontSize:11, color:T.copper, background:"none", border:"none", cursor:"pointer" }}>MAX</button>
          </div>
          <div style={{ position:"relative" }}>
            <span style={{ position:"absolute", left:18, top:"50%", transform:"translateY(-50%)", fontFamily:F.mono, fontSize:22, color:T.muted }}>$</span>
            <input
              type="number" value={amount} onChange={e => setAmount(clamp(+e.target.value, 0, max))}
              placeholder="0.00" max={max}
              style={{
                width:"100%", padding:"18px 18px 18px 38px",
                background:T.card, border:`1px solid ${T.border}`, borderRadius:14,
                color:T.champagne, fontFamily:F.mono, fontSize:26, outline:"none",
              }}
              onFocus={e => e.target.style.borderColor = T.copper}
              onBlur={e => e.target.style.borderColor = T.border}
            />
          </div>
          <input type="range" min={0} max={max} step={10} value={amount || 0}
            onChange={e => setAmount(+e.target.value)}
            style={{ marginTop:12 }}
          />
          <div style={{ display:"flex", justifyContent:"space-between", fontFamily:F.mono, fontSize:10, color:T.muted, marginTop:4 }}>
            <span>$0</span><span>{fmtUSD(max)}</span>
          </div>
        </div>

        {/* Summary */}
        {amount > 0 && (
          <Card style={{ background:T.surface }}>
            <Label>WITHDRAWAL SUMMARY</Label>
            {[
              ["Amount",      fmtUSD(amount)],
              ["Fee (0.2%)",  fmtUSD(fee)],
              ["You Receive", fmtUSD(amount - fee)],
            ].map(([k,v]) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:`1px solid ${T.border}` }}>
                <span style={{ fontFamily:F.ui, fontSize:13, color:T.muted }}>{k}</span>
                <span style={{ fontFamily:F.mono, fontSize:13, fontWeight:600, color: k==="You Receive" ? T.emerald : T.text }}>{v}</span>
              </div>
            ))}
          </Card>
        )}

        <Btn
          variant="primary" full size="lg"
          disabled={!amount || amount <= 0 || (dest === "crypto" && !address.trim())}
          onClick={handleWithdraw}
        >
          {loading
            ? <span style={{ width:18, height:18, border:`2px solid #fff4`, borderTopColor:"#fff", borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite" }} />
            : "Confirm Withdrawal"}
        </Btn>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//   SCREEN: AI ANALYSIS (calls Claude API)
// ═══════════════════════════════════════════════════════════
function AIScreen({ onBack }) {
  const [coin, setCoin]       = useState("BTC");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const analyze = async () => {
    setLoading(true);
    setAnalysis(null);
    setError("");
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `You are Le'Poro AI, an expert crypto trading analyst. Analyze ${coin} right now and respond ONLY with a JSON object (no markdown, no backticks) exactly in this shape:
{
  "signal": "BUY" | "SELL" | "HOLD",
  "confidence": 0-100,
  "riskLevel": "LOW" | "MODERATE" | "HIGH",
  "summary": "2-3 sentence market overview",
  "reasons": ["reason 1", "reason 2", "reason 3"],
  "priceTarget": "e.g. $42,000",
  "stopLoss": "e.g. $36,500",
  "timeframe": "e.g. 24–48 hours",
  "aiNote": "One sentence of Le'Poro AI's personal conviction on this trade"
}`
          }],
        }),
      });
      const data = await response.json();
      const raw = data.content?.[0]?.text || "";
      const clean = raw.replace(/```json|```/g, "").trim();
      setAnalysis(JSON.parse(clean));
    } catch (e) {
      setError("Analysis failed. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const sigColor = { BUY: T.emerald, SELL: T.red, HOLD: T.yellow };
  const riskColor = { LOW: T.emerald, MODERATE: T.yellow, HIGH: T.red };

  return (
    <div style={{ minHeight:"100vh", paddingBottom:86, background:T.bg }}>
      <Header onBack={onBack} title="AI Market Analysis" subtitle="POWERED BY LE'PORO AI" />
      <div style={{ padding:"20px" }}>

        {/* Coin selector */}
        <Card style={{ marginBottom:16 }}>
          <Label>SELECT CRYPTOCURRENCY</Label>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {COINS.map(c => (
              <button key={c.coin} onClick={() => { setCoin(c.coin); setAnalysis(null); }} style={{
                padding:"8px 16px", borderRadius:20, fontFamily:F.mono, fontSize:12, fontWeight:600,
                background: coin===c.coin ? `${c.color}22` : T.surface,
                border:`1px solid ${coin===c.coin ? c.color : T.border}`,
                color: coin===c.coin ? c.color : T.muted, cursor:"pointer", transition:"all 0.2s",
              }}>{c.coin}</button>
            ))}
            {["XRP","DOGE","AVAX"].map(c => (
              <button key={c} onClick={() => { setCoin(c); setAnalysis(null); }} style={{
                padding:"8px 16px", borderRadius:20, fontFamily:F.mono, fontSize:12, fontWeight:600,
                background: coin===c ? `${T.copper}18` : T.surface,
                border:`1px solid ${coin===c ? T.copper : T.border}`,
                color: coin===c ? T.copper : T.muted, cursor:"pointer", transition:"all 0.2s",
              }}>{c}</button>
            ))}
          </div>
        </Card>

        <Btn variant="primary" full size="lg" onClick={analyze} disabled={loading}>
          {loading
            ? <><span style={{ width:18, height:18, border:`2px solid #fff4`, borderTopColor:"#fff", borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite" }} /> Analyzing {coin}...</>
            : `✦ Analyze ${coin} with AI`}
        </Btn>

        {error && (
          <div style={{ marginTop:16, padding:"14px 16px", borderRadius:12, background:T.redFog, border:`1px solid ${T.red}44`, fontFamily:F.ui, fontSize:13, color:T.red }}>
            {error}
          </div>
        )}

        {analysis && (
          <div style={{ marginTop:20, display:"flex", flexDirection:"column", gap:14, animation:"fadeUp 0.4s ease" }}>

            {/* Signal hero */}
            <Card style={{ textAlign:"center", padding:28, border:`1px solid ${sigColor[analysis.signal]}44`, background:`${sigColor[analysis.signal]}08` }}>
              <div style={{ fontFamily:F.mono, fontSize:10, color:T.muted, letterSpacing:2, marginBottom:10 }}>AI SIGNAL FOR {coin}</div>
              <div style={{ fontFamily:F.display, fontSize:52, fontWeight:700, color:sigColor[analysis.signal] }}>
                {analysis.signal}
              </div>
              <div style={{ display:"flex", justifyContent:"center", gap:16, marginTop:14 }}>
                <Badge color={sigColor[analysis.signal]}>Confidence {analysis.confidence}%</Badge>
                <Badge color={riskColor[analysis.riskLevel]}>{analysis.riskLevel} RISK</Badge>
              </div>
              {/* Confidence bar */}
              <div style={{ height:6, background:T.border, borderRadius:3, marginTop:16, overflow:"hidden" }}>
                <div style={{ width:`${analysis.confidence}%`, height:"100%", background:sigColor[analysis.signal], borderRadius:3, transition:"width 0.8s ease" }} />
              </div>
            </Card>

            {/* Summary */}
            <Card>
              <Label>MARKET OVERVIEW</Label>
              <p style={{ fontFamily:F.ui, fontSize:14, color:T.text, lineHeight:1.7 }}>{analysis.summary}</p>
            </Card>

            {/* Reasons */}
            <Card>
              <Label>KEY SIGNALS DETECTED</Label>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {analysis.reasons?.map((r, i) => (
                  <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                    <span style={{ color:T.copper, fontFamily:F.mono, fontSize:12, fontWeight:700, flexShrink:0, marginTop:1 }}>0{i+1}</span>
                    <span style={{ fontFamily:F.ui, fontSize:13, color:T.muted, lineHeight:1.6 }}>{r}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Targets */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
              {[
                { l:"PRICE TARGET", v:analysis.priceTarget, c:T.emerald },
                { l:"STOP LOSS",    v:analysis.stopLoss,    c:T.red     },
                { l:"TIMEFRAME",    v:analysis.timeframe,   c:T.blue    },
              ].map(s => (
                <Card key={s.l} style={{ padding:"14px 12px", textAlign:"center" }}>
                  <div style={{ fontFamily:F.mono, fontSize:12, fontWeight:600, color:s.c }}>{s.v}</div>
                  <div style={{ fontFamily:F.mono, fontSize:8, color:T.muted, letterSpacing:1, marginTop:5 }}>{s.l}</div>
                </Card>
              ))}
            </div>

            {/* AI Note */}
            <Card style={{ background:`${T.copper}0C`, border:`1px solid ${T.copper}30` }}>
              <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                <span style={{ fontSize:20 }}>✦</span>
                <div>
                  <div style={{ fontFamily:F.mono, fontSize:9, color:T.copper, letterSpacing:1.5, marginBottom:6 }}>LE'PORO AI NOTE</div>
                  <p style={{ fontFamily:F.ui, fontSize:13, color:T.text, lineHeight:1.7 }}>{analysis.aiNote}</p>
                </div>
              </div>
            </Card>

            <div style={{ padding:"12px 16px", borderRadius:10, background:`${T.red}0A`, border:`1px solid ${T.red}20`, fontFamily:F.ui, fontSize:11, color:T.muted, lineHeight:1.6 }}>
              ⚠️ This is AI-generated analysis for informational purposes only. Crypto trading carries significant risk. Le'Poro's automated system applies additional risk controls before executing any trade.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//   SCREEN: NOTIFICATIONS
// ═══════════════════════════════════════════════════════════
function NotifScreen({ onBack }) {
  const [notifs, setNotifs] = useState(NOTIFICATIONS);
  const markAll = () => setNotifs(n => n.map(x => ({ ...x, read:true })));
  return (
    <div style={{ minHeight:"100vh", paddingBottom:86, background:T.bg }}>
      <Header onBack={onBack} title="Notifications"
        right={<Btn size="sm" variant="ghost" onClick={markAll}>Mark all read</Btn>}
      />
      <div style={{ padding:"20px", display:"flex", flexDirection:"column", gap:10 }}>
        {notifs.map(n => (
          <Card key={n.id} onClick={() => setNotifs(ns => ns.map(x => x.id===n.id ? {...x,read:true} : x))}
            style={{ padding:"14px 16px", borderLeft:`3px solid ${n.read ? T.border : T.copper}`, opacity: n.read ? 0.7 : 1 }}>
            <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
              <span style={{ fontSize:22, flexShrink:0 }}>{n.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ fontFamily:F.ui, fontSize:13, fontWeight:n.read ? 400 : 700 }}>{n.title}</div>
                  {!n.read && <Dot color={T.copper} />}
                </div>
                <div style={{ fontFamily:F.ui, fontSize:12, color:T.muted, marginTop:4, lineHeight:1.5 }}>{n.body}</div>
                <div style={{ fontFamily:F.mono, fontSize:10, color:T.muted, marginTop:6 }}>{n.time}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//   SCREEN: SETTINGS / ACCOUNT
// ═══════════════════════════════════════════════════════════
function SettingsScreen({ onNav, onLogout }) {
  const u = MOCK_USER;
  const p = MOCK_PORTFOLIO;
  const [risk, setRisk]   = useState(u.riskLevel);
  const [notif, setNotif] = useState(u.notifications);
  const [saved, setSaved] = useState(false);

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const toggle = (k) => setNotif(n => ({ ...n, [k]: !n[k] }));

  return (
    <div style={{ minHeight:"100vh", paddingBottom:86, background:T.bg }}>
      {/* Profile hero */}
      <div style={{
        padding:"32px 20px 24px",
        background:`radial-gradient(ellipse 80% 60% at 50% 0%, ${T.copperFog}, transparent)`,
        borderBottom:`1px solid ${T.border}`,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <div style={{
            width:64, height:64, borderRadius:18,
            background:`linear-gradient(135deg, ${T.copper}, ${T.copperDim})`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontFamily:F.display, fontSize:24, fontWeight:700, color:"#fff",
            boxShadow:`0 0 24px ${T.copperFog}`,
          }}>{u.avatar}</div>
          <div>
            <div style={{ fontFamily:F.display, fontSize:22, fontWeight:700, color:T.champagne }}>{u.name}</div>
            <div style={{ fontFamily:F.mono, fontSize:11, color:T.muted, marginTop:3 }}>{u.email}</div>
            <div style={{ display:"flex", gap:8, marginTop:8 }}>
              <Badge color={T.emerald}>✓ KYC Verified</Badge>
              <Badge color={T.blue}>{u.tier} Tier</Badge>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginTop:20 }}>
          {[
            { l:"TOTAL DEPOSITED",    v:fmtK(p.allTimeDeposits)    },
            { l:"TOTAL WITHDRAWN",    v:fmtK(p.allTimeWithdrawals)  },
            { l:"MEMBER SINCE",       v:u.joined                   },
          ].map(s => (
            <div key={s.l} style={{ background:T.card, borderRadius:12, padding:"10px", textAlign:"center", border:`1px solid ${T.border}` }}>
              <div style={{ fontFamily:F.mono, fontSize:13, fontWeight:600, color:T.text }}>{s.v}</div>
              <div style={{ fontFamily:F.mono, fontSize:8, color:T.muted, letterSpacing:1, marginTop:4 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding:"20px", display:"flex", flexDirection:"column", gap:16 }}>

        {/* Risk Profile */}
        <Card>
          <Label>AI RISK PROFILE</Label>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
            {["Conservative","Moderate","Aggressive"].map(r => (
              <button key={r} onClick={() => setRisk(r)} style={{
                padding:"12px 6px", borderRadius:10, fontFamily:F.ui, fontSize:11, fontWeight:600,
                background: risk===r ? `${T.copper}18` : T.surface,
                border:`1px solid ${risk===r ? T.copper : T.border}`,
                color: risk===r ? T.copper : T.muted, cursor:"pointer", transition:"all 0.2s",
              }}>
                <div style={{ fontSize:16, marginBottom:4 }}>{r==="Conservative"?"🛡️":r==="Moderate"?"⚖️":"⚡"}</div>
                {r}
              </button>
            ))}
          </div>
          <p style={{ fontFamily:F.ui, fontSize:12, color:T.muted, marginTop:12, lineHeight:1.6 }}>
            {risk === "Conservative" && "Lower returns, minimal drawdowns. AI favors stable large-caps and tight stops."}
            {risk === "Moderate"     && "Balanced risk/reward. AI trades mid to large caps with standard position sizing."}
            {risk === "Aggressive"   && "Higher potential returns. AI may take larger positions and trade altcoins."}
          </p>
        </Card>

        {/* Notifications */}
        <Card>
          <Label>NOTIFICATION PREFERENCES</Label>
          <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
            {[
              { k:"trades",  l:"Trade Alerts",       d:"Get notified on every AI trade" },
              { k:"deposits",l:"Deposit/Withdrawal",  d:"Transaction confirmations"      },
              { k:"weekly",  l:"Weekly Report",       d:"Performance summary every week" },
              { k:"news",    l:"Market News",         d:"Major crypto news and events"   },
            ].map(({ k, l, d }) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:`1px solid ${T.border}` }}>
                <div>
                  <div style={{ fontFamily:F.ui, fontSize:13, fontWeight:600 }}>{l}</div>
                  <div style={{ fontFamily:F.ui, fontSize:11, color:T.muted, marginTop:2 }}>{d}</div>
                </div>
                <div onClick={() => toggle(k)} style={{
                  width:44, height:24, borderRadius:12,
                  background: notif[k] ? T.copper : T.border,
                  cursor:"pointer", position:"relative", transition:"background 0.2s",
                  flexShrink:0,
                }}>
                  <div style={{
                    width:18, height:18, borderRadius:"50%", background:"#fff",
                    position:"absolute", top:3, left: notif[k] ? 23 : 3,
                    transition:"left 0.2s", boxShadow:"0 1px 4px #0008",
                  }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Security */}
        <Card>
          <Label>SECURITY</Label>
          {[
            { l:"Two-Factor Authentication", d:"Active · Google Authenticator", badge:true  },
            { l:"Biometric Login",           d:"Enabled on this device",         badge:true  },
            { l:"Change Password",           d:"Last changed 30 days ago",       badge:false },
            { l:"Active Sessions",           d:"2 devices logged in",            badge:false },
          ].map(item => (
            <div key={item.l} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:`1px solid ${T.border}`, cursor:"pointer" }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.8"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              <div>
                <div style={{ fontFamily:F.ui, fontSize:13, fontWeight:600 }}>{item.l}</div>
                <div style={{ fontFamily:F.ui, fontSize:11, color:T.muted, marginTop:2 }}>{item.d}</div>
              </div>
              {item.badge ? <Badge color={T.emerald}>On</Badge> : <span style={{ color:T.muted, fontSize:16 }}>›</span>}
            </div>
          ))}
        </Card>

        {/* Legal */}
        <Card>
          <Label>LEGAL &amp; SUPPORT</Label>
          {["Terms of Service", "Privacy Policy", "Fee Schedule", "Contact Support", "Help Center"].map(item => (
            <div key={item} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:`1px solid ${T.border}`, cursor:"pointer" }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.8"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              <span style={{ fontFamily:F.ui, fontSize:13 }}>{item}</span>
              <span style={{ color:T.muted, fontSize:16 }}>›</span>
            </div>
          ))}
        </Card>

        <Btn variant="ghost" full size="lg" onClick={save} style={{ border:`1px solid ${T.copper}`, color:T.copper }}>
          {saved ? "✓ Preferences Saved!" : "Save Preferences"}
        </Btn>

        <Btn variant="danger" full size="lg" onClick={onLogout}>Sign Out</Btn>

        <p style={{ fontFamily:F.mono, fontSize:10, color:T.muted, textAlign:"center" }}>
          Le'Poro v1.0.0 · Secured by 256-bit encryption<br />
          © {new Date().getFullYear()} Le'Poro Financial Technologies
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//   ROOT APP
// ═══════════════════════════════════════════════════════════
export default function App() {
  const [screen,   setScreen] = useState("splash");
  const [prevMain, setPrev]   = useState("dashboard");

  const navMain = (s) => {
    const mains = ["dashboard","portfolio","trades","ai","settings"];
    if (mains.includes(s)) setPrev(s);
    setScreen(s);
  };

  const MAIN_SCREENS = ["dashboard","portfolio","trades","ai","settings"];
  const isMain = MAIN_SCREENS.includes(screen);
  const unread = NOTIFICATIONS.filter(n => !n.read).length;

  return (
    <div style={{ maxWidth:480, margin:"0 auto", minHeight:"100vh", background:T.bg, position:"relative", overflow:"hidden" }}>
      <FontLink />
      <GlobalCSS />

      {screen === "splash" && <SplashScreen onContinue={() => setScreen("dashboard")} />}

      {screen === "dashboard" && (
        <Dashboard onNav={navMain} onNotif={() => setScreen("notif")} />
      )}
      {screen === "portfolio" && <PortfolioScreen onBack={() => setScreen("dashboard")} />}
      {screen === "trades"    && <TradesScreen onBack={() => setScreen("dashboard")} />}
      {screen === "ai"        && <AIScreen onBack={() => setScreen("dashboard")} />}
      {screen === "deposit"   && <DepositScreen onBack={() => setScreen("dashboard")} />}
      {screen === "withdraw"  && <WithdrawScreen onBack={() => setScreen("dashboard")} />}
      {screen === "notif"     && <NotifScreen onBack={() => setScreen("dashboard")} />}
      {screen === "settings"  && (
        <SettingsScreen
          onNav={navMain}
          onLogout={() => setScreen("splash")}
        />
      )}

      {isMain && (
        <BottomNav
          active={screen}
          onNav={navMain}
          unread={unread}
        />
      )}
    </div>
  );
}
