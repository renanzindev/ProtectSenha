

function getSecureRandomInt(max) {
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  // Utiliza o módulo para obter um número no intervalo desejado.
  // Nota: Este método pode introduzir um viés, mas para a maioria das aplicações é aceitável.
  return array[0] % max;
}


function secureShuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    // Gera um índice aleatório entre 0 e i (inclusive)
    let j = getSecureRandomInt(i + 1);
    // Troca os elementos de posição
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}


function getChartTypes() {
    const uppercase = document.querySelector('#include_uppercase').checked;
    const lowercase = document.querySelector('#include_lowercase').checked;
    const number = document.querySelector('#include_number').checked;
    const specialCharacter = document.querySelector('#include_special_character').checked;



    const charTypes = [];

    if (uppercase) {
        charTypes.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    }

    if (lowercase) {
        charTypes.push('abcdefghijklmnopqrstuvwxyz');
    }

    if (number) {
        charTypes.push('0123456789');
    }

    if (specialCharacter) {
        charTypes.push('!@#$%^&*()_-+={}[]|\\/?><:;"\'.,~`');
    }

    return charTypes;

}


function getPasswordSize() {
    const size = Number(document.querySelector('#size').value);
    
    if (isNaN(size) || size < 4 || size > 128) {
      message('Tamanho inválido, digite um número entre 4 e 128!', 'danger');
      return null; // Retorna null para indicar erro
    }


    return size;
}

/**
 * Gera a senha utilizando a API Criptográfica para selecionar os caracteres.
 * Garante que pelo menos um caractere de cada tipo selecionado seja incluído e, 
 * em seguida, completa e embaralha a senha.
 * @param {number} size - Tamanho desejado da senha
 * @param {Array} charTypes - Array com as strings de cada tipo de caractere selecionado
 * @returns {string} A senha gerada
 */


function generatePassword(size, charTypes) {
    let passwordGenerated = '';
    const selectedChars = charTypes.join('');

    // Insere pelo menos um caractere de cada tipo selecionado
  charTypes.forEach(type => {
    const index = getSecureRandomInt(type.length);
    passwordGenerated += type[index];
  });


   // Completa a senha até atingir o tamanho desejado
   while (passwordGenerated.length < size) {
    const index = getSecureRandomInt(selectedChars.length);
    passwordGenerated += selectedChars[index];
  }

   // Embaralha os caracteres da senha usando o algoritmo Fisher-Yates com a API Criptográfica
   let passwordArray = passwordGenerated.split('');
   passwordArray = secureShuffle(passwordArray);
   passwordGenerated = passwordArray.join('');
 
    return passwordGenerated;
}

function message(text, status = 'success') {
    Toastify({
        text: text,
        duration: 1000,
        style: {
            background: status === 'success' ? '#84cc16' : '#dc2626',
            boxShadow: 'none'
        }
    }).showToast();
}

// Função para avaliar a força da senha
function evaluateStrength(password, charTypes) {
    let strengthScore = 0;
  
    // Critério 1: Comprimento da senha
    if (password.length >= 12) {
      strengthScore += 2;
    } else if (password.length >= 8) {
      strengthScore += 1;
    }
  
    // Critério 2: Diversidade de tipos de caracteres
    if (charTypes.length >= 3) {
      strengthScore += 2;
    } else if (charTypes.length === 2) {
      strengthScore += 1;
    }
  
    // Calcula uma porcentagem com base no máximo de 4 pontos
    let percentage = (strengthScore / 4) * 100;
    let strengthText = "";
    let barColor = "";
  
    if (strengthScore <= 1) {
      strengthText = "Fraca";
      barColor = "#dc2626"; // Vermelho
    } else if (strengthScore <= 3) {
      strengthText = "Média";
      barColor = "#facc15"; // Amarelo
    } else {
      strengthText = "Forte";
      barColor = "#84cc16"; // Verde
    }
  
    return { percentage, strengthText, barColor };
  }

document.querySelector('#generate').addEventListener('click', function () {
    const size = getPasswordSize();
    if (!size) return;
    
    const charTypes = getChartTypes();
    if (!charTypes.length) {
        message('Selecione pelo menos um tipo de caractere!', 'danger');
        return;
      }


    const passwordGenerated = generatePassword(size, charTypes);

    document.querySelector('#password_container').classList.add('show');
    document.querySelector('#password').textContent = passwordGenerated;

    // Avalia a força da senha
  const strength = evaluateStrength(passwordGenerated, charTypes);

   // Atualiza o medidor de força
   const strengthBarInner = document.querySelector('#strength_bar_inner');
   const strengthTextElement = document.querySelector('#strength_text');
   strengthBarInner.style.width = strength.percentage + "%";
   strengthBarInner.style.backgroundColor = strength.barColor;
   strengthTextElement.textContent = "Força: " + strength.strengthText;
 
   // Exibe o medidor de força
   document.querySelector('#strength_meter').classList.add('show');
});

document.querySelector('#copy').addEventListener('click', function () {
    navigator.clipboard.writeText(document.querySelector('#password').textContent);
    message('Senha copiada com sucesso!', 'success');
});

document.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    // Simula o clique no botão de gerar senha
    document.querySelector('#generate').click();
  }
});