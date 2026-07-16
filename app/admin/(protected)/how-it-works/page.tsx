"use client";

import { SimpleCollectionAdmin, type FieldConfig } from "@/components/admin/SimpleCollectionAdmin";

interface StepDoc {
  title: string;
  description: string;
}

const FIELDS: FieldConfig<StepDoc>[] = [
  { key: "title", label: "Title", type: "text", required: true },
  { key: "description", label: "Description", type: "textarea", required: true },
];

const EMPTY: StepDoc = { title: "", description: "" };

export default function AdminHowItWorksPage() {
  return (
    <SimpleCollectionAdmin
      collectionName="howItWorksSteps"
      title="How it works"
      description="The numbered steps section on the homepage. Order here sets the step number."
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
