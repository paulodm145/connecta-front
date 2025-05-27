/**
 * Remove caracteres não numéricos de uma string.
 * @param value - A string a ser processada.
 * @returns A string contendo apenas números.
 */
export const cleanInput = (value: string): string => {
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

/**
 * Máscara para CPF.
 * Exemplo de entrada:  "12345678901"
 * Exemplo de saída:    "123.456.789-01"
 */
export function maskCPF(value = '') {
  // Remove tudo que não for dígito
  const digits = value.replace(/\D/g, '');

  // Aplica a formatação de acordo com a quantidade de dígitos
  if (digits.length <= 3) {
    return digits;
  } else if (digits.length <= 6) {
    return digits.replace(/(\d{3})(\d+)/, '$1.$2');
  } else if (digits.length <= 9) {
    return digits.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
  } else {
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
  }
}

/**
 * Máscara para CNPJ.
 * Exemplo de entrada:  "12345678000199"
 * Exemplo de saída:    "12.345.678/0001-99"
 */
export function maskCNPJ(value = '') {
  const digits = value.replace(/\D/g, '');

  if (digits.length <= 2) {
    return digits;
  } else if (digits.length <= 5) {
    return digits.replace(/(\d{2})(\d+)/, '$1.$2');
  } else if (digits.length <= 8) {
    return digits.replace(/(\d{2})(\d{3})(\d+)/, '$1.$2.$3');
  } else if (digits.length <= 12) {
    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d+)/, '$1.$2.$3/$4');
  } else {
    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})/, '$1.$2.$3/$4-$5');
  }
}


/**
 * Máscara para CPF ou CNPJ (determina automaticamente pelo tamanho).
 */
export function maskCPFOrCNPJ(value = '') {
  const digits = value.replace(/\D/g, '');
  // Se tiver 11 dígitos ou menos, formata como CPF; senão, como CNPJ
  return digits.length <= 11 ? maskCPF(digits) : maskCNPJ(digits);
}

/**
 * Máscara para telefone brasileiro.
 * Considera variações de 10 ou 11 dígitos.
 * Ex: "999999999" => "(99) 9999-9999"
 * Ex: "99999999999" => "(99) 9 9999-9999"
 */
export function maskBRPhone(value = '') {
  const digits = value.replace(/\D/g, '');

  // Telefone fixo ou sem nono dígito (10 dígitos)
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  }

  // Telefone celular com 9 dígitos (11 dígitos)
  return digits.replace(/(\d{2})(\d{1})(\d{4})(\d{0,4})/, '($1) $2 $3-$4');
}

/**
 * Formata número para o padrão monetário brasileiro (R$).
 * Exemplo: 1000.5 => "R$ 1.000,50"
 */
export function formatToBRL(value: string) {
  // Converte para número
  const num = parseFloat(value);

  // Se não for um número válido, retorna R$ 0,00
  if (isNaN(num)) {
    return 'R$ 0,00';
  }

  // Formata para moeda brasileira
  return num.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

/**
 * Verifica se a senha atende aos requisitos mínimos de segurança.
 * @param senha String representando a senha a ser validada.
 * @returns Retorna true se a senha for considerada “difícil”, senão retorna false.
 */
export function ehSenhaDificil(senha: string): boolean {
  // Validação de tamanho (mínimo de 8 caracteres)
  const minimoOitoCaracteres = /^.{8,}$/;
  
  // Deve conter ao menos uma letra maiúscula [A-Z]
  const contemMaiuscula = /[A-Z]/;
  
  // Deve conter ao menos uma letra minúscula [a-z]
  const contemMinuscula = /[a-z]/;
  
  // Deve conter ao menos um dígito [0-9]
  const contemDigito = /[0-9]/;
  
  // Deve conter ao menos um caractere especial
  // (exemplo de caracteres especiais: !@#$%^&*() etc.)
  const contemCaractereEspecial = /[!@#$%^&*(),.?":{}|<>]/;

  return (
    minimoOitoCaracteres.test(senha) &&
    contemMaiuscula.test(senha) &&
    contemMinuscula.test(senha) &&
    contemDigito.test(senha) &&
    contemCaractereEspecial.test(senha)
  );
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  // Converte a base64 em um blob
  const byteCharacters = atob(content);
  const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) =>
    byteCharacters.charCodeAt(i)
  );
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], {
    type: mimeType,
  });

  // Cria uma URL para download
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();

  // Libera a memória
  URL.revokeObjectURL(url);
}





