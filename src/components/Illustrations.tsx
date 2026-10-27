import React from 'react';
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import { colors } from '../theme';
import { useT } from '../useT';

/** Original network glyph (not the ABCDx logo). */
export function BrainMark({ size = 32, color = colors.brand }: { size?: number; color?: string }) {
  const nodes: [number, number][] = [
    [12, 9],
    [30, 6],
    [42, 20],
    [35, 38],
    [17, 40],
    [6, 26],
    [24, 24],
  ];
  const edges: [number, number][] = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 0],
    [6, 0],
    [6, 1],
    [6, 2],
    [6, 3],
    [6, 4],
    [6, 5],
  ];
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      {edges.map(([a, b], i) => (
        <Line key={i} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} stroke={color} strokeWidth={1.6} opacity={0.55} />
      ))}
      {nodes.map(([x, y], i) => (
        <Circle key={i} cx={x} cy={y} r={i === 6 ? 5 : 3.4} fill={color} />
      ))}
    </Svg>
  );
}

function dropPath(cx: number, cy: number): string {
  return `M${cx} ${cy - 12} C ${cx + 8} ${cy - 2}, ${cx + 10} ${cy + 3}, ${cx + 10} ${cy + 6} a10 10 0 0 1 -20 0 C ${cx - 10} ${cy + 3}, ${cx - 8} ${cy - 2}, ${cx} ${cy - 12} Z`;
}

export type Liquid = 'blood' | 'diluentA' | 'diluentB';

const liquidColor: Record<Liquid, string> = {
  blood: '#B91C1C',
  diluentA: '#1D6FB8',
  diluentB: '#6D28D9',
};

const liquidLabel: Record<Liquid, string> = { blood: '', diluentA: 'A', diluentB: 'B' };

const LEFT_X = 82;
const RIGHT_X = 178;
const WELL_Y = 92;

export function Cassette({
  target,
  liquid,
  count,
  filled = {},
  width = 280,
  scanning,
}: {
  target?: 'left' | 'right';
  liquid?: Liquid;
  count?: number;
  filled?: { left?: Liquid; right?: Liquid };
  width?: number;
  scanning?: boolean;
}) {
  const t = useT();
  const height = (width * 170) / 260;
  const tx = target === 'left' ? LEFT_X : RIGHT_X;
  return (
    <Svg width={width} height={height} viewBox="0 0 260 170">
      <Rect x={16} y={42} width={228} height={106} rx={20} fill="#FFFFFF" stroke="#CBD5E1" strokeWidth={2} />
      <Rect x={28} y={54} width={204} height={82} rx={13} fill="#F1F5F9" />
      <Rect x={104} y={70} width={52} height={12} rx={4} fill="#FFFFFF" stroke="#CBD5E1" />
      <Rect x={104} y={100} width={52} height={12} rx={4} fill="#FFFFFF" stroke="#CBD5E1" />
      {scanning ? (
        <G>
          <Rect x={104} y={70} width={52} height={12} rx={4} fill="none" stroke={colors.go} strokeWidth={2} />
          <Rect x={104} y={100} width={52} height={12} rx={4} fill="none" stroke={colors.go} strokeWidth={2} />
        </G>
      ) : null}

      {([['left', LEFT_X], ['right', RIGHT_X]] as const).map(([side, x]) => (
        <G key={side}>
          <Circle cx={x} cy={WELL_Y} r={17} fill="#E2E8F0" stroke="#94A3B8" strokeWidth={1.5} />
          <Circle cx={x} cy={WELL_Y} r={9} fill={filled[side] ? liquidColor[filled[side] as Liquid] : '#CBD5E1'} />
          <SvgText x={x} y={WELL_Y + 36} fontSize={11} fontWeight="700" fill="#64748B" textAnchor="middle">
            {side === 'left' ? t('cassetteLeft') : t('cassetteRight')}
          </SvgText>
        </G>
      ))}

      {target && liquid ? (
        <G>
          <Circle cx={tx} cy={WELL_Y} r={25} fill="none" stroke={colors.brand} strokeWidth={3} strokeDasharray="6 5" />
          <Line x1={tx} y1={30} x2={tx} y2={WELL_Y - 28} stroke={colors.brand} strokeWidth={2} strokeDasharray="3 4" />
          <Path d={dropPath(tx, 20)} fill={liquidColor[liquid]} />
          {liquidLabel[liquid] ? (
            <SvgText x={tx} y={26} fontSize={11} fontWeight="800" fill="#FFFFFF" textAnchor="middle">
              {liquidLabel[liquid]}
            </SvgText>
          ) : null}
          {count ? (
            <SvgText x={tx + 22} y={26} fontSize={20} fontWeight="800" fill={colors.ink}>
              {`${count}×`}
            </SvgText>
          ) : null}
        </G>
      ) : null}
    </Svg>
  );
}

export function TubeIllustration({ width = 280 }: { width?: number }) {
  const t = useT();
  const height = (width * 170) / 260;
  return (
    <Svg width={width} height={height} viewBox="0 0 260 170">
      <Rect x={82} y={18} width={96} height={136} rx={0} fill="none" />
      {/* tube */}
      <Rect x={112} y={30} width={36} height={116} rx={18} fill="#FEE2E2" stroke="#CBD5E1" strokeWidth={2} />
      <Path d="M114 84 H146 V128 A16 16 0 0 1 130 144 A16 16 0 0 1 114 128 Z" fill="#B91C1C" />
      <Rect x={106} y={14} width={48} height={24} rx={8} fill="#15803D" />
      <Rect x={106} y={30} width={48} height={8} rx={2} fill="#166534" />
      {/* label */}
      <Rect x={160} y={64} width={74} height={34} rx={8} fill="#FFFFFF" stroke="#CBD5E1" />
      <SvgText x={197} y={85} fontSize={12} fontWeight="800" fill="#15803D" textAnchor="middle">
        {t('heparin')}
      </SvgText>
      <Line x1={148} y1={81} x2={160} y2={81} stroke="#CBD5E1" strokeWidth={2} />
      <Path d={dropPath(70, 78)} fill="#B91C1C" />
      <Path d={dropPath(52, 108)} fill="#B91C1C" opacity={0.5} />
    </Svg>
  );
}

export function NetworkHero({ size = 220 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 220 220">
      <Circle cx={110} cy={110} r={104} fill={colors.brandTint} />
      <Circle cx={110} cy={110} r={74} fill="#FFFFFF" opacity={0.7} />
      <G transform="translate(46 46) scale(2.67)">
        <BrainMarkShapes />
      </G>
    </Svg>
  );
}

function BrainMarkShapes() {
  const nodes: [number, number][] = [
    [12, 9],
    [30, 6],
    [42, 20],
    [35, 38],
    [17, 40],
    [6, 26],
    [24, 24],
  ];
  return (
    <G>
      {nodes.map(([x, y], i) =>
        nodes.slice(i + 1).map(([x2, y2], j) => (
          <Line key={`${i}-${j}`} x1={x} y1={y} x2={x2} y2={y2} stroke={colors.brand} strokeWidth={0.8} opacity={0.35} />
        )),
      )}
      {nodes.map(([x, y], i) => (
        <Circle key={i} cx={x} cy={y} r={i === 6 ? 5 : 3.4} fill={colors.brand} />
      ))}
    </G>
  );
}
