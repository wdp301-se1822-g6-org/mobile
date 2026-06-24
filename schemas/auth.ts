import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('email'),
  password: z.string().min(1, 'required').min(6, 'pw_min'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export function validate<T>(
  schema: z.ZodType<T>,
  data: unknown,
): { success: true; data: T } | { success: false; errors: FieldErrors<T> } {
  const result = schema.safeParse(data);
  if (result.success) return { success: true, data: result.data };
  const errors: FieldErrors<T> = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof T;
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return { success: false, errors };
}
