import type { TranslationKey } from '@/i18n/useT';

type Translator = (
  key: TranslationKey,
  vars?: Record<string, string | number>,
) => string;

type VehicleErrorField = 'licensePlate' | 'vehicleType';

type ApiError = {
  code?: string;
  response?: {
    status?: number;
    data?: {
      message?: string | string[];
    };
  };
};

type ClassifiedError = {
  key: TranslationKey;
  field?: VehicleErrorField;
};

function classifyMessage(message: string): ClassifiedError | undefined {
  const value = message.toLowerCase().trim();
  const mentionsPlate =
    value.includes('license plate') ||
    value.includes('licenseplate') ||
    value.includes('license_plate') ||
    value.includes('plate') ||
    value.includes('biển số');
  const isDuplicate =
    value.includes('already registered') ||
    value.includes('already exists') ||
    value.includes('already used') ||
    value.includes('already in use') ||
    value.includes('already taken') ||
    value.includes('exists') ||
    value.includes('duplicate') ||
    value.includes('e11000');

  if ((mentionsPlate && isDuplicate) || (value.includes('vehicle') && isDuplicate)) {
    return { key: 'vehicle.addErrPlateExists', field: 'licensePlate' };
  }
  if (mentionsPlate && (value.includes('should not be empty') || value.includes('is required'))) {
    return { key: 'vehicle.addErrPlateRequired', field: 'licensePlate' };
  }
  if (mentionsPlate && (value.includes('20') || value.includes('too long'))) {
    return { key: 'vehicle.addErrPlateMax', field: 'licensePlate' };
  }
  if (mentionsPlate) {
    return { key: 'vehicle.addErrPlateInvalid', field: 'licensePlate' };
  }
  if (
    value.includes('vehicletypeid') &&
    (value.includes('should not be empty') || value.includes('is required'))
  ) {
    return { key: 'vehicle.addErrTypeRequired', field: 'vehicleType' };
  }
  if (
    value.includes('vehicle type') ||
    value.includes('vehicletypeid') ||
    value.includes('vehicle type id')
  ) {
    return { key: 'vehicle.addErrTypeUnavailable', field: 'vehicleType' };
  }
  if (value.includes('too many requests') || value.includes('rate limit')) {
    return { key: 'vehicle.addErrTooManyRequests' };
  }

  return undefined;
}

export function localizedVehicleError(
  error: unknown,
  t: Translator,
): { message: string; field?: VehicleErrorField } {
  const apiError = error as ApiError;
  const status = apiError.response?.status;
  const code = apiError.code?.toUpperCase();
  const rawMessage = apiError.response?.data?.message;
  const messages = Array.isArray(rawMessage)
    ? rawMessage
    : rawMessage
      ? [rawMessage]
      : [];
  const classified = messages.map(classifyMessage).find(Boolean);

  if (classified) {
    return { message: t(classified.key), field: classified.field };
  }
  if (status === 409) {
    return {
      message: t('vehicle.addErrPlateExists'),
      field: 'licensePlate',
    };
  }
  if (status === 401 || status === 403) {
    return { message: t('vehicle.addErrUnauthorized') };
  }
  if (status === 429) {
    return { message: t('vehicle.addErrTooManyRequests') };
  }
  if (status != null && status >= 500) {
    return { message: t('vehicle.addErrServer') };
  }
  if (code === 'ECONNABORTED' || code === 'ETIMEDOUT') {
    return { message: t('vehicle.addErrTimeout') };
  }
  if (!apiError.response || code === 'ERR_NETWORK') {
    return { message: t('vehicle.addErrNetwork') };
  }
  if (status === 400) {
    return { message: t('vehicle.addErrInvalidData') };
  }

  return { message: t('vehicle.addErrFallback') };
}
