import { TranslationKey } from '@/i18n/useT';

type Translator = (
  key: TranslationKey,
  vars?: Record<string, string | number>,
) => string;

type ApiError = {
  code?: string;
  response?: {
    status?: number;
    data?: {
      message?: string | string[];
    };
  };
};

function messageKey(message: string): TranslationKey | undefined {
  const value = message.toLowerCase().trim();

  if (value.includes('invalid credentials') || value.includes('incorrect email or password')) {
    return 'auth.loginErrSub';
  }
  if (
    value.includes('email already registered') ||
    value.includes('email already exists') ||
    value.includes('duplicate email')
  ) {
    return 'auth.errEmailRegistered';
  }
  if (
    value.includes('phone already registered') ||
    value.includes('phone already exists') ||
    value.includes('duplicate phone')
  ) {
    return 'auth.errPhoneRegistered';
  }
  if (value.includes('account') && (value.includes('inactive') || value.includes('disabled') || value.includes('blocked'))) {
    return 'auth.errAccountInactive';
  }
  if (value.includes('user not found') || value.includes('account not found') || value.includes('email not found')) {
    return 'auth.errAccountNotFound';
  }
  if (value.includes('name') && (value.includes('should not be empty') || value.includes('is required'))) {
    return 'auth.errNameRequired';
  }
  if (value.includes('name') && (value.includes('100') || value.includes('too long'))) {
    return 'auth.errNameMax';
  }
  if (value.includes('phone') && (value.includes('should not be empty') || value.includes('is required'))) {
    return 'auth.errPhoneRequired';
  }
  if (value.includes('phone')) {
    return 'auth.errPhoneInvalid';
  }
  if (value.includes('email') && (value.includes('should not be empty') || value.includes('is required'))) {
    return 'auth.errEmailRequired';
  }
  if (value.includes('email') && (value.includes('must be an email') || value.includes('invalid'))) {
    return 'auth.errEmailInvalid';
  }
  if (value.includes('password') && (value.includes('should not be empty') || value.includes('is required'))) {
    return 'auth.errPasswordRequired';
  }
  if (value.includes('password') && (value.includes('longer than or equal to 8') || value.includes('at least 8'))) {
    return 'auth.errPwMin';
  }
  if (value.includes('password') && (value.includes('72') || value.includes('too long'))) {
    return 'auth.errPwMax';
  }
  if (value.includes('dateofbirth') || value.includes('date of birth')) {
    return 'auth.errDobInvalid';
  }
  if (
    value.includes('invalid or expired otp') ||
    value.includes('invalid otp') ||
    value.includes('otp expired') ||
    value.includes('expired code')
  ) {
    return 'auth.otpVerifyErr';
  }
  if (value.includes('code') && value.includes('6')) {
    return 'auth.errOtpLength';
  }
  if (value.includes('too many requests') || value.includes('rate limit')) {
    return 'auth.errTooManyRequests';
  }

  return undefined;
}

export function localizedAuthError(
  error: unknown,
  t: Translator,
  fallback: TranslationKey,
): string {
  const apiError = error as ApiError;
  const status = apiError.response?.status;
  const code = apiError.code?.toUpperCase();
  const rawMessage = apiError.response?.data?.message;
  const messages = Array.isArray(rawMessage)
    ? rawMessage
    : rawMessage
      ? [rawMessage]
      : [];

  const translated = messages
    .map(messageKey)
    .filter((key): key is TranslationKey => !!key)
    .map((key) => t(key));
  const unique = [...new Set(translated)];

  if (unique.length > 0) return unique.join(', ');
  if (status === 429) return t('auth.errTooManyRequests');
  if (status != null && status >= 500) return t('auth.errServer');
  if (code === 'ECONNABORTED' || code === 'ETIMEDOUT') return t('auth.errTimeout');
  if (!apiError.response || code === 'ERR_NETWORK') return t('auth.errNetwork');

  return t(fallback);
}
