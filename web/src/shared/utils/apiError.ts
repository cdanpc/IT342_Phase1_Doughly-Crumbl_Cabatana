export function getApiErrorMessage(error: unknown, fallback: string): string {
  const responseMessage = (
    error as { response?: { data?: { message?: string; error?: string } } }
  )?.response?.data?.message;

  if (responseMessage) return responseMessage;

  const responseError = (
    error as { response?: { data?: { message?: string; error?: string } } }
  )?.response?.data?.error;

  return responseError || fallback;
}
