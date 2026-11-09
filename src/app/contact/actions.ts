"use server";

import { createClient } from "@/lib/supabase/server";

export interface InquiryActionResult {
  success: boolean;
  error?: string;
}

export async function submitPublicInquiry(
  _prevState: InquiryActionResult | null,
  formData: FormData
): Promise<InquiryActionResult> {
  const customer_name = String(formData.get("customer_name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const email_raw = String(formData.get("email") || "").trim();
  const email = email_raw ? email_raw : null;
  const city = String(formData.get("city") || "").trim() || null;
  const address = String(formData.get("address") || "").trim() || null;
  const message = String(formData.get("message") || "").trim();

  // Basic validation according to DB constraints
  if (customer_name.length < 2 || customer_name.length > 100) {
    return {
      success: false,
      error: "Please enter a valid full name (2 to 100 characters).",
    };
  }
  if (phone.length < 7 || phone.length > 25) {
    return {
      success: false,
      error: "Please enter a valid phone number (at least 7 digits).",
    };
  }
  if (email && !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) {
    return {
      success: false,
      error: "Please enter a valid email address or leave it blank.",
    };
  }
  if (message.length < 5 || message.length > 2000) {
    return {
      success: false,
      error:
        "Please provide project details or message (at least 5 characters).",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("inquiries").insert({
    customer_name,
    phone,
    email,
    city,
    address,
    message,
    status: "new",
    assigned_to: null,
    internal_notes: null,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
