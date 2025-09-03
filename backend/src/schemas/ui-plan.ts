import { z } from 'zod';

const nodeSchema: z.ZodType<any> = z.object({
  id: z.string(),
  type: z.enum(['Hero', 'CategoryGrid', 'Banner', 'ProductCard']),
  props: z.record(z.any()).default({}),
  children: z.lazy(() => z.array(nodeSchema)).optional(),
});

export const uiPlanSchema = z.object({
  version: z.literal('1'),
  sections: z.array(nodeSchema),
});

export type UIPlan = z.infer<typeof uiPlanSchema>;
