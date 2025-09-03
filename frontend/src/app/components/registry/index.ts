import { Hero } from './Hero';
import { CategoryGrid } from './CategoryGrid';

export const REGISTRY = {
  Hero: { Cmp: Hero },
  CategoryGrid: { Cmp: CategoryGrid },
} as const;
