export type FormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export const initialFormState: FormState = { status: "idle" };
