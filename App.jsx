
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Target, Activity, TrendingUp, User, Ruler, Zap, PlayCircle } from "lucide-react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, XAxis, YAxis, Tooltip, Bar, CartesianGrid } from "recharts";

const pros = {
  curry: { name: "Stephen Curry", title: "Elite Range", releaseHeightFactor: 1.33, elbowAlignment: 96, wristSnap: 99, baseBalance: 94, arcAngle: 51, releaseQuickness: 95, followThrough: 98, tip: "Tuck elbow in line with body and snap wrist straight." },
  jordan: { name: "Michael Jordan", title: "High Release", releaseHeightFactor: 1.39, elbowAlignment: 92, wristSnap: 95, baseBalance: 96, arcAngle: 49, releaseQuickness: 92, followThrough: 95, tip: "Strong base, rise vertically, release high above defender." },
  lebron: { name: "LeBron James", title: "Power Balance", releaseHeightFactor: 1.35, elbowAlignment: 90, wristSnap: 91, baseBalance: 98, arcAngle: 47, releaseQuickness: 89, followThrough: 90, tip: "Load hips, square shoulders, finish through the ball." },
};

const defaults = { athleteName: "", age: 15, heightIn: 72, weightLb: 165, armLengthIn: 31, standingReachIn: 94, verticalIn: 24, shotType: "free_throw", elbowAlignment: 72, wristSnap: 70, baseBalance: 74, arcAngle: 47, releaseQuickness: 68, followThrough: 73, repsPerWeek: 200 };

function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
function releaseHeight(form) { return +(form.standingReachIn * 0.9 + form.armLengthIn * 0.2 + form.verticalIn * 0.22).toFixed(1); }
function shotDistance(shotType) { if (shotType === "free_throw") return 15; if (shotType === "mid_range") return 18; return 23.75; }
function shotScore(form) {
  const rel = releaseHeight(form);
  const releaseScore = clamp((rel / 110) * 100, 50, 99);
  const arcScore = clamp(100 - Math.abs(form.arcAngle - 49) * 4, 45, 99);
  const mechanics = clamp(form.elbowAlignment * 0.32 + form.wristSnap * 0.22 + form.baseBalance * 0.24 + form.followThrough * 0.22, 0, 100);
  const rhythm = clamp(form.releaseQuickness * 0.7 + Math.min(form.repsPerWeek / 5, 30), 0, 100);
  const powerFit = clamp(100 - Math.abs((form.heightIn + form.verticalIn * 0.25) - 78) * 2, 55, 98);
  const total = Math.round(releaseScore * 0.18 + arcScore * 0.2 + mechanics * 0.34 + rhythm * 0.16 + powerFit * 0.12);
  return { releaseScore, arcScore, mechanics, rhythm, powerFit, total };
}
function likelyComparison(form) {
  const relFactor = releaseHeight(form) / form.heightIn;
  const distances = Object.entries(pros).map(([key, p]) => ({
    key,
    score:
      Math.abs(relFactor - p.releaseHeightFactor) * 100 +
      Math.abs(form.elbowAlignment - p.elbowAlignment) * 0.9 +
      Math.abs(form.wristSnap - p.wristSnap) * 0.7 +
      Math.abs(form.baseBalance - p.baseBalance) * 0.7 +
      Math.abs(form.arcAngle - p.arcAngle) * 2.3 +
      Math.abs(form.releaseQuickness - p.releaseQuickness) * 0.6 +
      Math.abs(form.followThrough - p.followThrough) * 0.7
  }));
  return distances.sort((a, b) => a.score - b.score)[0].key;
}
function metricRows(form) {
  return [
    { name: "Elbow", user: form.elbowAlignment, curry: pros.curry.elbowAlignment, jordan: pros.jordan.elbowAlignment, lebron: pros.lebron.elbowAlignment },
    { name: "Wrist", user: form.wristSnap, curry: pros.curry.wristSnap, jordan: pros.jordan.wristSnap, lebron: pros.lebron.wristSnap },
    { name: "Balance", user: form.baseBalance, curry: pros.curry.baseBalance, jordan: pros.jordan.baseBalance, lebron: pros.lebron.baseBalance },
    { name: "Quickness", user: form.releaseQuickness, curry: pros.curry.releaseQuickness, jordan: pros.jordan.releaseQuickness, lebron: pros.lebron.releaseQuickness },
    { name: "Follow", user: form.followThrough, curry: pros.curry.followThrough, jordan: pros.jordan.followThrough, lebron: pros.lebron.followThrough },
  ];
}

export default function App() {
  const [form, setForm] = useState(defaults);
  const [tab, setTab] = useState("simulator");
  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const score = useMemo(() => shotScore(form), [form]);
  const compKey = useMemo(() => likelyComparison(form), [form]);
  const pro = pros[compKey];
  const rel = useMemo(() => releaseHeight(form), [form]);
  const distance = shotDistance(form.shotType);

  const radarData = [
    { metric: "Elbow", user: form.elbowAlignment, pro: pro.elbowAlignment },
    { metric: "Wrist", user: form.wristSnap, pro: pro.wristSnap },
    { metric: "Balance", user: form.baseBalance, pro: pro.baseBalance },
    { metric: "Quick", user: form.releaseQuickness, pro: pro.releaseQuickness },
    { metric: "Follow", user: form.followThrough, pro: pro.followThrough },
  ];
  const bars = metricRows(form);
  const recommendations = [
    form.elbowAlignment < 85 ? "Keep your shooting elbow tucked closer to your torso." : "Elbow alignment is strong.",
    form.wristSnap < 85 ? "Finish with fingers down and a straighter wrist snap." : "Wrist snap is efficient.",
    form.baseBalance < 85 ? "Widen your stance slightly and land balanced on both feet." : "Base balance is stable.",
    Math.abs(form.arcAngle - 49) > 3 ? `Adjust arc toward 49° for better touch from ${distance} ft.` : "Arc angle is in a strong window.",
    form.repsPerWeek < 250 ? "Increase weekly reps to build consistency and muscle memory." : "Weekly rep volume supports good development.",
  ];

  return (
    <div className="app-shell">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="hero">
        <div className="hero-left">
          <div className="logo-box"><Target size={30} /></div>
          <div><h1>LEVELUP</h1><p>Basketball mechanics simulator for free throws and field goals</p></div>
        </div>
        <div className="stat-grid">
          <StatChip icon={<Trophy size={14} />} label="Shot Score" value={`${score.total}`} />
          <StatChip icon={<Ruler size={14} />} label="Release" value={`${rel}"`} />
          <StatChip icon={<Zap size={14} />} label="Shot Type" value={form.shotType.replace("_", " ")} />
          <StatChip icon={<User size={14} />} label="Closest Pro" value={pro.name} />
        </div>
      </motion.div>

      <div className="tabs">
        {["simulator", "compare", "tips", "progress"].map((t) => (
          <button key={t} className={tab === t ? "tab active" : "tab"} onClick={() => setTab(t)}>
            {t === "simulator" ? "Simulator" : t === "compare" ? "Vs The Pros" : t === "tips" ? "Video Tips" : "Progress"}
          </button>
        ))}
      </div>

      {tab === "simulator" && (
        <div className="grid-two">
          <section className="card">
            <h2>Athlete Input</h2>
            <div className="form-grid">
              <Field label="Athlete Name"><input value={form.athleteName} onChange={(e) => update("athleteName", e.target.value)} placeholder="Enter name" /></Field>
              <Field label="Age"><input type="number" value={form.age} onChange={(e) => update("age", Number(e.target.value))} /></Field>
              <Field label="Height (inches)"><input type="number" value={form.heightIn} onChange={(e) => update("heightIn", Number(e.target.value))} /></Field>
              <Field label="Weight (lb)"><input type="number" value={form.weightLb} onChange={(e) => update("weightLb", Number(e.target.value))} /></Field>
              <Field label="Arm Length (inches)"><input type="number" value={form.armLengthIn} onChange={(e) => update("armLengthIn", Number(e.target.value))} /></Field>
              <Field label="Standing Reach (inches)"><input type="number" value={form.standingReachIn} onChange={(e) => update("standingReachIn", Number(e.target.value))} /></Field>
              <Field label="Vertical Jump (inches)"><input type="number" value={form.verticalIn} onChange={(e) => update("verticalIn", Number(e.target.value))} /></Field>
              <Field label="Shot Type">
                <select value={form.shotType} onChange={(e) => update("shotType", e.target.value)}>
                  <option value="free_throw">Free Throw</option>
                  <option value="mid_range">Field Goal / Mid-Range</option>
                  <option value="three_point">Three Point</option>
                </select>
              </Field>
            </div>

            <div className="sliders">
              <SliderField label={`Elbow Alignment: ${form.elbowAlignment}`} value={form.elbowAlignment} min={40} max={100} onChange={(v) => update("elbowAlignment", Number(v))} />
              <SliderField label={`Wrist Snap: ${form.wristSnap}`} value={form.wristSnap} min={40} max={100} onChange={(v) => update("wristSnap", Number(v))} />
              <SliderField label={`Base Balance: ${form.baseBalance}`} value={form.baseBalance} min={40} max={100} onChange={(v) => update("baseBalance", Number(v))} />
              <SliderField label={`Arc Angle: ${form.arcAngle}°`} value={form.arcAngle} min={35} max={60} onChange={(v) => update("arcAngle", Number(v))} />
              <SliderField label={`Release Quickness: ${form.releaseQuickness}`} value={form.releaseQuickness} min={40} max={100} onChange={(v) => update("releaseQuickness", Number(v))} />
              <SliderField label={`Follow Through: ${form.followThrough}`} value={form.followThrough} min={40} max={100} onChange={(v) => update("followThrough", Number(v))} />
              <SliderField label={`Weekly Reps: ${form.repsPerWeek}`} value={form.repsPerWeek} min={50} max={1000} onChange={(v) => update("repsPerWeek", Number(v))} />
            </div>
          </section>

          <section className="card">
            <h2>Simulation Output</h2>
            <div className="output-grid">
              <OutputCard title="Shot Score" value={`${score.total}/100`} subtitle="overall mechanics grade" />
              <OutputCard title="Release Height" value={`${rel}"`} subtitle="estimated release point" />
              <OutputCard title="Distance" value={`${distance} ft`} subtitle="current shot scenario" />
              <OutputCard title="Closest Pro" value={pro.name} subtitle={pro.title} />
            </div>
            <div className="meter-wrap">
              <Metric title="Mechanics" value={Math.round(score.mechanics)} />
              <Metric title="Arc Efficiency" value={Math.round(score.arcScore)} />
              <Metric title="Rhythm / Speed" value={Math.round(score.rhythm)} />
              <Metric title="Release Height Value" value={Math.round(score.releaseScore)} />
            </div>
            <div className="summary-box">
              <div className="summary-top"><h3>Mechanics Summary</h3><span className="badge">{pro.name} style</span></div>
              <p>Your current input most closely matches <strong>{pro.name}</strong>. This model emphasizes <span className="cyan">{pro.title.toLowerCase()}</span>.</p>
              <p className="small">Recommended cue: {pro.tip}</p>
            </div>
          </section>
        </div>
      )}

      {tab === "compare" && (
        <>
          <div className="grid-two">
            <section className="card chart-card"><h2>Your Form vs {pro.name}</h2><div className="chart-box"><ResponsiveContainer width="100%" height="100%"><RadarChart data={radarData}><PolarGrid stroke="#334155" /><PolarAngleAxis dataKey="metric" stroke="#cbd5e1" /><PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#64748b" /><Radar dataKey="user" name="You" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.35} /><Radar dataKey="pro" name={pro.name} stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.25} /></RadarChart></ResponsiveContainer></div></section>
            <section className="card chart-card"><h2>Vs The Pros</h2><div className="chart-box"><ResponsiveContainer width="100%" height="100%"><BarChart data={bars}><CartesianGrid strokeDasharray="3 3" stroke="#1e293b" /><XAxis dataKey="name" stroke="#cbd5e1" /><YAxis stroke="#cbd5e1" domain={[0, 100]} /><Tooltip /><Bar dataKey="user" fill="#22d3ee" radius={[6, 6, 0, 0]} /><Bar dataKey="curry" fill="#2563eb" radius={[6, 6, 0, 0]} /><Bar dataKey="jordan" fill="#f59e0b" radius={[6, 6, 0, 0]} /><Bar dataKey="lebron" fill="#84cc16" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div></section>
          </div>
          <div className="pros-grid">
            {Object.values(pros).map((p) => (
              <div key={p.name} className={p.name === pro.name ? "pro-card selected" : "pro-card"}>
                <div className="pro-top"><div><h3>{p.name}</h3><p>{p.title}</p></div>{p.name === pro.name && <span className="badge">Closest Match</span>}</div>
                <div className="pro-stats"><div>Elbow: {p.elbowAlignment}</div><div>Wrist: {p.wristSnap}</div><div>Balance: {p.baseBalance}</div><div>Arc: {p.arcAngle}°</div></div>
                <p className="cyan">{p.tip}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "tips" && (
        <div className="grid-two">
          <section className="card">
            <h2>Video Tip Screen</h2>
            <div className="phone">
              <div className="phone-header"><div className="brand">LEVELUP</div><div className="subbrand">WATCH VIDEO TIP</div></div>
              <div className="tip-banner">{pro.tip}</div>
              <div className="phone-video"><PlayCircle size={80} /><div className="video-meta"><div className="progress-line"><span /></div><div className="small-row"><span>Improve your shot</span><span>1:23</span></div></div></div>
              <div className="nav-grid"><div>Drills</div><div className="active-nav">Home</div><div>Progress</div><div>Account</div></div>
            </div>
          </section>
          <section className="card">
            <h2>Coaching Tips</h2>
            <div className="tips-list">
              {recommendations.map((item, index) => (
                <motion.div key={index} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.06 }} className="tip-item">
                  <div className="tip-num">{index + 1}</div><p>{item}</p>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      )}

      {tab === "progress" && (
        <>
          <div className="progress-grid">
            <OutputCard icon={<Target size={18} />} title="Free Throw Projection" value={`${Math.round(score.total * 0.88)}%`} subtitle="simulated make rate" />
            <OutputCard icon={<Activity size={18} />} title="Field Goal Projection" value={`${Math.round(score.total * 0.63)}%`} subtitle="mid-range estimate" />
            <OutputCard icon={<TrendingUp size={18} />} title="Growth Potential" value={`${Math.round((100 - score.total) * 0.6)} pts`} subtitle="available improvement" />
            <OutputCard icon={<Trophy size={18} />} title="Weekly Plan" value={`${Math.max(250, form.repsPerWeek)} reps`} subtitle="recommended practice" />
          </div>
          <section className="card">
            <h2>Development Plan</h2>
            <div className="plan-grid">
              <PlanCard title="Form Block" text="50 one-hand form shots from close range focusing on elbow path and wrist finish." />
              <PlanCard title="Balance Block" text="3 sets of 20 set shots with hold-the-finish landing on balanced feet." />
              <PlanCard title="Game Block" text="5 spots x 10 makes each at your selected shot distance." />
              <PlanCard title="Pressure Block" text="Make 10 free throws in a row before ending practice." />
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function Field({ label, children }) { return <div className="field"><label>{label}</label>{children}</div>; }
function SliderField({ label, value, min, max, onChange }) { return <div className="field"><label>{label}</label><input type="range" min={min} max={max} value={value} onChange={(e) => onChange(e.target.value)} /></div>; }
function Metric({ title, value }) { return <div className="metric"><div className="metric-row"><span>{title}</span><span>{value}%</span></div><div className="bar"><span style={{ width: `${value}%` }} /></div></div>; }
function OutputCard({ title, value, subtitle, icon }) { return <div className="output-card"><div className="output-top"><span>{title}</span>{icon || null}</div><div className="output-value">{value}</div><div className="output-sub">{subtitle}</div></div>; }
function StatChip({ icon, label, value }) { return <div className="stat-chip"><div className="stat-label">{icon}<span>{label}</span></div><div className="stat-value">{value}</div></div>; }
function PlanCard({ title, text }) { return <div className="plan-card"><h3>{title}</h3><p>{text}</p></div>; }
