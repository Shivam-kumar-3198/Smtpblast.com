"use client";

import { SimpleCollectionAdmin, type FieldConfig } from "@/components/admin/SimpleCollectionAdmin";

interface TestimonialDoc {
  name: string;
  role: string;
  company: string;
  quote: string;
  metric: string;
  date: string;
  source: string;
  country: string;
}

const FIELDS: FieldConfig<TestimonialDoc>[] = [
  { key: "quote", label: "Quote", type: "textarea", required: true },
  { key: "name", label: "Name", type: "text", required: true },
  { key: "role", label: "Role", type: "text" },
  { key: "company", label: "Company", type: "text" },
  { key: "metric", label: "Metric (optional callout)", type: "text" },
  { key: "date", label: "Date", type: "text" },
  { key: "source", label: "Source (where this was said)", type: "text", required: true },
  {
    key: "country",
    label: "Country (flag emoji + name, e.g. \"🇩🇪 Germany\") — shown in the worldwide row",
    type: "text",
  },
];

const EMPTY: TestimonialDoc = {
  name: "",
  role: "",
  company: "",
  quote: "",
  metric: "",
  date: "",
  source: "",
  country: "",
};

export default function AdminTestimonialsPage() {
  return (
    <SimpleCollectionAdmin
      collectionName="testimonials"
      title="Testimonials"
      description="Quotes shown in the social proof section on the homepage."
      fields={FIELDS}
      emptyItem={EMPTY}
      renderPreview={(item) => (
        <div>
          <p className="text-sm text-ink-950">&ldquo;{item.quote}&rdquo;</p>
          <p className="mt-1.5 text-xs text-slate-500">
            {item.name}
            {item.company ? ` · ${item.company}` : ""}
            {item.country ? ` · ${item.country}` : ""}
          </p>
        </div>
      )}
    />
  );
}
