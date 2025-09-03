'use client';
import React from 'react';
import { REGISTRY } from './registry';

type Node = { id: string; type: keyof typeof REGISTRY; props?: Record<string, unknown>; children?: Node[]; };
type Plan = { version: '1'; sections: Node[] };

export function PlanRenderer({ plan }: { plan: Plan }) {
  return (
    <div className="space-y-6">
      {plan.sections?.map(n => <RenderNode key={n.id} node={n} />)}
    </div>
  );
}

function RenderNode({ node }: { node: Node }) {
  const entry = REGISTRY[node.type];
  if (!entry) return null; // ignora tipos desconocidos
  const Cmp = entry.Cmp as React.ComponentType<Record<string, unknown> & { children?: React.ReactNode }>;
  const props = node.props || {};
  return (
    <Cmp {...props} key={node.id}>
      {node.children?.map(c => <RenderNode key={c.id} node={c} />)}
    </Cmp>
  );
}
