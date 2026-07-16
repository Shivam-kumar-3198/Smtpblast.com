"use client";

import { SimpleCollectionAdmin, type FieldConfig } from "@/components/admin/SimpleCollectionAdmin";

interface FaqDoc {
  question: string;
  answer: string;
}

const FIELDS: FieldConfig<FaqDoc>[] = [
  { key: "question", label: "Question", type: "text", required: true },
  { key: "answer", label: "Answer", type: "textarea", required: true },
];

const EMPTY: FaqDoc = { question: "", answer: "" };

export default function AdminFaqPage() {
  return (
    <SimpleCollectionAdmin
      collectionName="faqItems"
      title="FAQ"
      description="Questions shown on the homepage FAQ section and on service pages."
      fields={FIELDS}
      emptyItem={EMPTY}
      renderPreview={(item) => (
        <div>
          <p className="text-sm font-medium text-ink-950">{item.question}</p>
          <p className="mt-1 line-clamp-2 text-xs text-slate-500">{item.answer}</p>
        </div>
      )}
    />
  );
}
