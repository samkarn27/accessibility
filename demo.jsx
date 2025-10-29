import React from "react";
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";

/**
 * Generic SemiCircularProgress component
 *
 * Props:
 * - value: number → current value
 * - min: number → minimum value
 * - max: number → maximum value
 * - startAngle: number → start of arc (e.g. 225)
 * - endAngle: number → end of arc (e.g. -45)
 * - size: number → pixel width/height
 * - thickness: number → arc thickness as % of radius
 * - milestones: [{ value: number, label: string }]
 * - fillColor, backgroundColor: strings
 * - valueToProgress: (value, min, max) => number 0–100 → custom progress logic
 * - valueToAngle: (value, progress, startAngle, endAngle) => radians → custom angle logic
 * - formatLabel: (value, progress) => string → text shown in center
 */

const SemiCircularProgress = ({
  value = 0,
  min = 0,
  max = 100,
  startAngle = 225,
  endAngle = -45,
  size = 256,
  thickness = 10,
  fillColor = "#00B8FF",
  backgroundColor = "#222",
  milestones = [],
  showCenterLabel = true,
  valueToProgress, // custom progress calculation
  valueToAngle, // custom angle calculation
  formatLabel = (val, progress) => `${val} (${progress.toFixed(1)}%)`,
}) => {
  const clampedValue = Math.min(Math.max(value, min), max);

  // === PROGRESS CALCULATION ===
  const defaultProgressFn = (v, minVal, maxVal) =>
    ((v - minVal) / (maxVal - minVal)) * 100;

  const progressFn = valueToProgress || defaultProgressFn;
  const progress = progressFn(clampedValue, min, max);

  // === ANGLE CALCULATION ===
  const defaultAngleFn = (v, prog, start, end) => {
    const totalArc = (start - end + 360) % 360;
    const angle = start - (prog / 100) * totalArc;
    return (angle * Math.PI) / 180; // radians
  };

  const angleFn = valueToAngle || defaultAngleFn;

  // === MILESTONE UTILITIES ===
  const ARC_RADIUS = size / 2;
  const getPosition = (angle, radius) => ({
    x: radius * Math.cos(angle),
    y: radius * Math.sin(angle),
  });

  // === CHART DATA ===
  const data = [{ name: "Progress", value: progress, fill: fillColor }];

  return (
    <div
      style={{
        width: size,
        height: size,
        margin: "0 auto",
        position: "relative",
        background: "transparent",
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius={`${100 - thickness * 2}%`}
          outerRadius={`${100 - thickness}%`}
          startAngle={startAngle}
          endAngle={endAngle}
          barSize={20}
          data={data}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar
            background={{ fill: backgroundColor }}
            clockWise
            dataKey="value"
            cornerRadius={10}
          />
        </RadialBarChart>
      </ResponsiveContainer>

      {/* === MILESTONE DOTS === */}
      {milestones.map((m, i) => {
        const milestoneProgress = progressFn(m.value, min, max);
        const angle = angleFn(m.value, milestoneProgress, startAngle, endAngle);
        const pos = getPosition(angle, ARC_RADIUS * 0.8);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translate(${pos.x - 4}px, ${-pos.y - 4}px)`,
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#fff",
            }}
          />
        );
      })}

      {/* === MILESTONE LABELS === */}
      {milestones.map((m, i) => {
        const milestoneProgress = progressFn(m.value, min, max);
        const angle = angleFn(m.value, milestoneProgress, startAngle, endAngle);
        const pos = getPosition(angle, ARC_RADIUS * 1.05);
        return (
          <div
            key={i + "-label"}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translate(${pos.x - 12}px, ${-pos.y - 6}px)`,
              color: "#fff",
              fontSize: 10,
            }}
          >
            {m.label}
          </div>
        );
      })}

      {/* === CENTER LABEL === */}
      {showCenterLabel && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            color: "#fff",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: "bold" }}>
            {formatLabel(value, progress)}
          </div>
        </div>
      )}
    </div>
  );
};

export default SemiCircularProgress;


import SemiCircularProgress from "./SemiCircularProgress";

const bankingProgressFn = (value, min, max) => {
  const START_OFFSET = 8.7;
  if (value <= 0) return 0;
  if (value >= max) return 100;
  return START_OFFSET + ((value - min) / (max - min)) * (100 - START_OFFSET);
};

<SemiCircularProgress
  value={50000}
  min={0}
  max={100000}
  fillColor="#00B8FF"
  backgroundColor="#0a0f1f"
  milestones={[
    { value: 10000, label: "$10k" },
    { value: 50000, label: "$50k" },
    { value: 100000, label: "$100k" },
  ]}
  valueToProgress={bankingProgressFn}
  formatLabel={(val, progress) => `$${val.toLocaleString()} (${progress.toFixed(2)}%)`}
/>;
