export const isName = (strInput: string) => {
  if (!strInput.length) return false;
  const pattern = /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/;
  return !!strInput.match(pattern);
};

export const isEmail = (strInput: string) => {
  if (!strInput.length) return false;
  const pattern = /^[\w-.]+@([\w-]+.)+[\w-]{2,4}$/g;
  return !!strInput.match(pattern);
};

export const isCEALicense = (strInput: string) => {
  if (!strInput.length) return false;
  const pattern = /^[A-Z]\d{6}[A-Z]$/;
  return !!strInput.match(pattern);
};
