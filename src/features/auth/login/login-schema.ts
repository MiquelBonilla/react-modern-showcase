import { z } from 'zod';
import i18n from '@shared/lib/i18n';

export const loginSchema = z.object({
  name: z.string().min(1, i18n.t('login.errors.usernameRequired')),
  password: z.string().min(1, i18n.t('login.errors.passwordRequired')),
});

export type LoginFormData = z.infer<typeof loginSchema>;
