"use client";

import { SimpleCollectionAdmin, type FieldConfig } from "@/components/admin/SimpleCollectionAdmin";

interface FeatureDoc {
  icon: string;
  title: string;
  description: string;
  metric: string;
  href: string;
}

const FIELDS: FieldConfig<FeatureDoc>[] = [
  { key: "title", label: "Title", type: "text", required: true },
  { key: "description", label: "Description", type: "textarea", required: true },
  {
    key: "icon",
    label: "Icon (lucide-react name, e.g. Rocket)",
    type: "text",
    required: true,
  },
  { key: "metric", label: "Metric callout (optional)", type: "text" },
  { key: "href", label: "Link (optional)", type: "text" },
];

const EMPTY: FeatureDoc = { icon: "", title: "", description: "", metric: "", href: "" };

export default function AdminFeaturesPage() {
  return (
    <SimpleCollectionAdmin
      collectionName="bentoFeatures"
      title="Features"
      description="The 'Built for teams sending real volume' bento grid on the homepage."
      fields={FIELDS}
      emptyItem={EMPTY}
      renderPreview={(item) => (
        <div>
          <p className="text-sm font-medium text-ink-950">{item.title}</p>
          <p className="mt-1 line-clamp-2 text-xs text-slate-500">{item.description}</p>
        </div>
      )}
    />
  );
}
