import { z } from "zod";

export const planOptions = [
  "basic",
  "standard",
  "premium",
  "enterprise",
  "cluster",
  "custom",
  "not-sure",
] as const;

export const leadSchema = z
  .object({
    name: z.string().trim().min(1, "Enter your name").max(120),
    // Optional here because the site-wide popup only collects a mobile
    // number, not an email — LeadForm (get-started/talk-to-sales) still
    // marks it required in its own UI and always sends one. The refine
    // below is what actually guarantees every lead has a way to reach them.
    email: z.string().trim().email("Enter a valid email address").max(200).optional().or(z.literal("")),
    phone: z.string().trim().max(40).optional().or(z.literal("")),
    company: z.string().trim().max(160).optional().or(z.literal("")),
    planInterest: z.enum(planOptions).optional(),
    message: z.string().trim().max(2000).optional().or(z.literal("")),
    source: z.string().trim().max(60),
    // Honeypot: real users never see or fill this field. Checked separately
    // in the route handler so a filled value returns a fake success instead
    // of a validation error that would tip off the bot.
    company_website: z.string().optional().or(z.literal("")),
  })
  .refine((data) => (data.email ?? "").trim() !== "" || (data.phone ?? "").trim() !== "", {
    message: "Enter an email or a mobile number so we can reach you.",
    path: ["phone"],
  });

export type LeadInput = z.infer<typeof leadSchema>;
