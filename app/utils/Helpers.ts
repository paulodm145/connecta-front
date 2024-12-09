/**
 * Remove caracteres não numéricos de uma string.
 * @param value - A string a ser processada.
 * @returns A string contendo apenas números.
 */
const cleanInput = (value: string): string => {
    return value.replace(/\D/g, '');
  };
  
  /**
   * Valida se um CNPJ é válido.
   * @param cnpj - O CNPJ a ser validado.
   * @returns Verdadeiro se o CNPJ for válido; caso contrário, falso.
   */
  export const isValidCNPJ = (cnpj: string): boolean => {
    const cleanedCNPJ = cleanInput(cnpj);
  
    if (cleanedCNPJ.length !== 14) return false;
  
    // Elimina CNPJs com todos os dígitos iguais
    if (/^(\d)\1+$/.test(cleanedCNPJ)) return false;
  
    const calculateDigit = (base: string): number => {
      let factor = base.length - 7;
      const total = base.split('').reduce((acc, num) => {
        acc += parseInt(num, 10) * factor--;
        if (factor < 2) factor = 9;
        return acc;
      }, 0);
      const result = 11 - (total % 11);
      return result > 9 ? 0 : result;
    };
  
    const base = cleanedCNPJ.slice(0, 12);
    const digit1 = calculateDigit(base);
    const digit2 = calculateDigit(base + digit1.toString());
  
    return cleanedCNPJ === base + digit1.toString() + digit2.toString();
  };

/**
 * Aplica uma máscara ao CEP no formato "99999-999".
 * @param cep - O CEP como uma string ou número.
 * @returns O CEP formatado ou uma string vazia se o CEP for inválido.
 */
export const  maskCep =(cep: string | number): string => {
  if (!cep) return "";

  // Converte o CEP para string e remove caracteres não numéricos
  const cleanedCep = cep.toString().replace(/\D/g, "");

  // Verifica se o CEP possui exatamente 8 dígitos
  if (cleanedCep.length !== 8) {
    console.warn("CEP inválido. Deve conter exatamente 8 dígitos.");
    return "";
  }

  // Aplica a máscara no formato "99999-999"
  return cleanedCep.replace(/(\d{5})(\d{3})/, "$1-$2");
}  


/**
 * Valida se um e-mail tem um formato válido.
 * @param email - O e-mail a ser validado.
 * @returns Verdadeiro se o e-mail for válido; caso contrário, falso.
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};