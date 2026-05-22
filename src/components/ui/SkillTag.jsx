import { getCategoryById } from '../../utils/constants';
import './SkillTag.css';

/**
 * SkillTag
 *
 * Props:
 *  category  — category id string (e.g. 'tech', 'music') OR pass color+label manually
 *  label     — override label text
 *  color     — override hex color
 *  size      — 'sm' | 'md'  (default: 'sm')
 *  onClick   — if provided, tag becomes clickable/filterable
 *  active    — bool, highlighted state (for filter use)
 */
export default function SkillTag({
  category,
  label: labelProp,
  color: colorProp,
  size = 'sm',
  onClick,
  active = false,
  className = '',
}) {
  const cat = category ? getCategoryById(category) : null;
  const label = labelProp ?? cat?.label ?? category ?? 'Other';
  const color = colorProp ?? cat?.color ?? '#8A8070';

  // Convert hex to rgb for alpha background
  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1,3), 16);
    const g = parseInt(hex.slice(3,5), 16);
    const b = parseInt(hex.slice(5,7), 16);
    return `${r}, ${g}, ${b}`;
  };

  const rgb = hexToRgb(color);

  const style = {
    '--tag-color': color,
    '--tag-rgb': rgb,
  };

  const Tag = onClick ? 'button' : 'span';

  return (
    <Tag
      className={[
        'ss-tag',
        `ss-tag--${size}`,
        active ? 'ss-tag--active' : '',
        onClick ? 'ss-tag--clickable' : '',
        className,
      ].filter(Boolean).join(' ')}
      style={style}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
    >
      {label}
    </Tag>
  );
}
