interface IValidatePasswordOptions {
  minLength?: number;
  upperCase?: boolean;
  numberCase?: boolean;
  symbol?: boolean;
}

const validatePassword = (password: string, options: IValidatePasswordOptions = {}): boolean => {
  const { minLength = 8, upperCase = false, numberCase = false, symbol = false } = options;

  if (password.includes(' ')) {
    return false;
  }

  let regexStr = `^`;

  if (upperCase) {
    regexStr += `(?=(?:[^A-Z]*[A-Z]){${Number(upperCase)}})`;
  }

  if (numberCase) {
    regexStr += `(?=(?:\\D*\\d){${Number(numberCase)}})`;
  }

  if (symbol) {
    regexStr += `(?=(?:[^!@#$%^&*)(]*[!@#$%^&*)(]){${Number(symbol)}})`;
  }

  regexStr += `.{${minLength},}$`;

  const regx = new RegExp(regexStr);

  return regx.test(password);
};

export default validatePassword;
