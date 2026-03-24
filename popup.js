document.addEventListener('DOMContentLoaded', () => {
  const unitValueInput = document.getElementById('unitValue');
  const totalAmount = document.getElementById('totalAmount');
  const tabs = document.querySelectorAll('.tab-btn');
  const dynamicFields = document.getElementById('dynamic-fields');

  let currentMode = 'simples';
  
  // 1. Carrega o valor salvo
  chrome.storage.local.get(['savedUnitValue'], (result) => {
    if (result.savedUnitValue) {
      unitValueInput.value = result.savedUnitValue;
    }
    renderFields();
  });

  // 2. Salva a unidade sempre que você alterar
  unitValueInput.addEventListener('input', () => {
    const val = parseFloat(unitValueInput.value) || 0;
    if (val > 0) chrome.storage.local.set({ savedUnitValue: val });
    calculateAll();
  });

  // 3. Gerencia o clique nas abas (Simples / Dupla / Tripla)
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      tabs.forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      currentMode = e.target.getAttribute('data-mode');
      renderFields();
    });
  });

  // 4. Desenha os inputs certos dependendo do modo
  function renderFields() {
    dynamicFields.innerHTML = '';
    let fieldsConfig = [];

    if (currentMode === 'simples') {
      fieldsConfig = [
        { id: 'ap_simples', label: 'Unidades da Aposta (u):' }
      ];
    } else if (currentMode === 'dupla') {
      fieldsConfig = [
        { id: 'ap_1', label: 'Aposta 1 (u):' },
        { id: 'ap_2', label: 'Aposta 2 (u):' },
        { id: 'ap_dupla', label: 'Stake Dupla (u):' }
      ];
    } else if (currentMode === 'tripla') {
      fieldsConfig = [
        { id: 'ap_1', label: 'Aposta 1 (u):' },
        { id: 'ap_2', label: 'Aposta 2 (u):' },
        { id: 'ap_3', label: 'Aposta 3 (u):' },
        { id: 'ap_tripla', label: 'Stake Tripla (u):' }
      ];
    }

    fieldsConfig.forEach((field, index) => {
      const row = document.createElement('div');
      row.className = 'field-row';
      
      // Destaca a última linha (múltipla)
      if (index === fieldsConfig.length - 1 && currentMode !== 'simples') {
          row.style.borderLeftColor = '#28a745'; 
      }

      row.innerHTML = `
        <div class="field-input-area">
            <label for="${field.id}">${field.label}</label>
            <input type="number" id="${field.id}" step="0.05" min="0" placeholder="Ex: 0.5">
        </div>
        <div class="field-result" id="res_${field.id}">R$ 0,00</div>
      `;
      dynamicFields.appendChild(row);

      document.getElementById(field.id).addEventListener('input', calculateAll);
    });

    calculateAll();
    
    if (fieldsConfig.length > 0) {
      document.getElementById(fieldsConfig[0].id).focus();
    }
  }

  // 5. Faz a matemática inteira
  function calculateAll() {
    const unit = parseFloat(unitValueInput.value) || 0;
    let totalUnits = 0;

    const inputs = dynamicFields.querySelectorAll('input[type="number"]');
    
    inputs.forEach(input => {
      const val = parseFloat(input.value) || 0;
      totalUnits += val;
      
      const resDiv = document.getElementById(`res_${input.id}`);
      if (resDiv) {
        resDiv.textContent = (val * unit).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      }
    });

    totalAmount.textContent = (totalUnits * unit).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
});