// ================================================
// SkillSwap — Shared constants
// ================================================

/** FastAPI backend base URL (Shreyas's Module 3) */
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

/** Skill categories — used in SkillTag, PostSkillPage, SkillBoardPage */
export const SKILL_CATEGORIES = [
  { id: 'tech',      label: 'Tech & Coding',      color: '#4A6FA5' },
  { id: 'creative',  label: 'Creative & Art',      color: '#9B5FC0' },
  { id: 'education', label: 'Teaching & Tutoring', color: '#5A7A5C' },
  { id: 'home',      label: 'Home & Repairs',      color: '#C0692A' },
  { id: 'health',    label: 'Health & Wellness',   color: '#C05A7A' },
  { id: 'food',      label: 'Cooking & Baking',    color: '#E8A23A' },
  { id: 'music',     label: 'Music & Performing',  color: '#5AAAC0' },
  { id: 'language',  label: 'Languages',           color: '#7A8C5A' },
  { id: 'other',     label: 'Other',               color: '#8A8070' },
];

/** Get a category object by id */
export const getCategoryById = (id) =>
  SKILL_CATEGORIES.find(c => c.id === id) ?? SKILL_CATEGORIES.at(-1);
