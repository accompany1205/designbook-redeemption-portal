export const validateEmail = (email: string) => {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (re.test(String(email).toLowerCase())) return undefined;
  else return 'Invalid email address';
}

export const validatePassword = (password: string) => {
  const re = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]?)[A-Za-z\d@$!%*#?&]{8,}$/i
  if (password.length < 8) return 'Password must be at least 8 characters long';
  else if (password.length > 32) return 'Password must be less than 32 characters long';
  else if (!re.test(password)) return 'Password must contain at least one letter, one number and one special character';
  else return undefined;
}

export const validateName = (name: string) => {
  if (name.length < 3) return "Name must be atleast 3 characters long"
  else return undefined
}

export const validateText = (text: string) => {
  if (text.trim().length === 0) return "This field is required"
  else return undefined
}
export function validateHederaAddress(address: string): boolean {
  // The regex pattern for a valid Hedera address
  const addressPattern = /^(0\.0\.\d+)$/;

  // Test if the provided address matches the pattern
  return addressPattern.test(address);
}

export const validatePhone = (phone: string) => {
  const re = /^\d{10}$/; // 10 digit number
  if (re.test(phone)) return undefined;
  else return 'Invalid phone number';
}

export const validateUsername = (username: string) => {
  const re = /^[a-zA-Z0-9]+$/;
  if (username.length < 3) return "Username must be atleast 3 characters long"
  else if (username.length > 32) return "Username must be less than 32 characters long"
  else if (!re.test(username)) return "Username must contain only letters and numbers"
  else return undefined
}