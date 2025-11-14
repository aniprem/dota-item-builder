// Конфигурация бонусов
const bonuses = [
    { id: 'Damage', name: '🗡️ Бонус к урону', key: 'bonus_damage', modifier: 'MODIFIER_PROPERTY_PREATTACK_BONUS_DAMAGE', function: 'GetModifierPreAttack_BonusDamage' },
    { id: 'AttackRange', name: '🎯 Бонус к дальности атаки', key: 'bonus_attack_range', modifier: 'MODIFIER_PROPERTY_ATTACK_RANGE_BONUS', function: 'GetModifierAttackRangeBonus' },
    { id: 'Armor', name: '🛡️ Бонус к броне', key: 'bonus_armor', modifier: 'MODIFIER_PROPERTY_PHYSICAL_ARMOR_BONUS', function: 'GetModifierPhysicalArmorBonus' },
    { id: 'AttackSpeed', name: '⚡ Бонус к скорости атаки', key: 'bonus_attack_speed', modifier: 'MODIFIER_PROPERTY_ATTACKSPEED_BONUS_CONSTANT', function: 'GetModifierAttackSpeedBonus_Constant' }
];

// Элементы DOM
const elements = {
    itemName: document.getElementById('itemName'),
    nameError: document.getElementById('nameError'),
    generateBtn: document.getElementById('generateBtn'),
    validationStatus: document.getElementById('validationStatus'),
    kvOutput: document.getElementById('kvOutput'),
    luaOutput: document.getElementById('luaOutput'),
    abilityBehavior: document.getElementById('abilityBehavior'),
    itemMaxLevel: document.getElementById('itemMaxLevel'),
    itemCost: document.getElementById('itemCost'),
    itemSellable: document.getElementById('itemSellable'),
    itemPurchasable: document.getElementById('itemPurchasable'),
    itemDroppable: document.getElementById('itemDroppable'),
    downloadKvBtn: document.getElementById('downloadKvBtn'),
    downloadLuaBtn: document.getElementById('downloadLuaBtn')
};

// Инициализация
function init() {
    setupEventListeners();
    updateCostField();
    updateBonusFields();
    validateForm();
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Основные элементы
    elements.itemName.addEventListener('input', handleNameInput);
    elements.itemMaxLevel.addEventListener('change', handleMaxLevelChange);
    elements.itemMaxLevel.addEventListener('input', handleMaxLevelInput);
    
    // Бонусы
    bonuses.forEach(bonus => {
        document.getElementById(`enable${bonus.id}Bonus`).addEventListener('change', handleBonusToggle);
    });
    
    // Общие обработчики
    document.querySelectorAll('input, select').forEach(el => {
        if (!['itemName', 'itemMaxLevel'].includes(el.id)) {
            el.addEventListener('input', validateForm);
            el.addEventListener('change', validateForm);
        }
    });
    
    // Кнопки
    elements.generateBtn.addEventListener('click', generateCode);
    elements.downloadKvBtn.addEventListener('click', () => downloadFile('kv'));
    elements.downloadLuaBtn.addEventListener('click', () => downloadFile('lua'));
}

// Обработчики событий
function handleNameInput(e) {
    const value = e.target.value;
    const isValid = /^[a-zA-Z_]*$/.test(value);
    
    elements.nameError.style.display = isValid ? 'none' : 'block';
    e.target.value = value.replace(/[^a-zA-Z_]/g, '');
    validateForm();
}

function handleMaxLevelChange() {
    updateCostField();
    updateBonusFields();
    validateForm();
}

function handleMaxLevelInput(e) {
    let value = parseInt(e.target.value);
    e.target.value = Math.min(100, Math.max(1, value));
    handleMaxLevelChange();
}

function handleBonusToggle(e) {
    const bonusId = e.target.id.replace('enable', '').replace('Bonus', '');
    const container = document.getElementById(`bonus${bonusId}Levels`);
    container.style.display = e.target.checked ? 'grid' : 'none';
    if (e.target.checked) updateBonusFields();
    validateForm();
}

// Обновление UI
function updateCostField() {
    const maxLevel = parseInt(elements.itemMaxLevel.value);
    elements.itemCost.disabled = maxLevel > 1;
    elements.itemCost.title = maxLevel > 1 ? 
        "Для многоуровневых предметов стоимость устанавливается через рецепты" : "";
    if (maxLevel > 1) elements.itemCost.value = "0";
}

function updateBonusFields() {
    const maxLevel = parseInt(elements.itemMaxLevel.value);
    
    bonuses.forEach(bonus => {
        const container = document.getElementById(`bonus${bonus.id}Levels`);
        container.innerHTML = '';
        
        for (let level = 1; level <= maxLevel; level++) {
            const group = document.createElement('div');
            group.className = 'bonus-level-group';
            group.innerHTML = `
                <label>Уровень ${level}:</label>
                <input type="number" id="bonus${bonus.id}_${level}" class="bonus-level-input" value="0">
            `;
            container.appendChild(group);
        }
        
        // Обработчики для новых полей
        container.querySelectorAll('.bonus-level-input').forEach(input => {
            input.addEventListener('input', validateForm);
        });
    });
}

// Валидация
function validateForm() {
    const name = elements.itemName.value.trim();
    const cost = elements.itemCost.value;
    const maxLevel = elements.itemMaxLevel.value;
    
    const errors = [];
    if (!name) errors.push("Название предмета");
    if (!cost || cost < 0) errors.push("Стоимость предмета");
    if (!maxLevel || maxLevel < 1 || maxLevel > 100) errors.push("Максимальный уровень (1-100)");
    
    const isValid = errors.length === 0;
    
    elements.validationStatus.innerHTML = isValid ? 
        '<span class="success-icon">✅</span><span>Все параметры заполнены корректно</span>' :
        `<span class="error-icon">❌</span><span>Заполните: ${errors.join(', ')}</span>`;
    
    elements.validationStatus.className = `validation-status ${isValid ? 'valid' : 'invalid'}`;
    elements.generateBtn.disabled = !isValid;
    elements.downloadKvBtn.disabled = !isValid;
    elements.downloadLuaBtn.disabled = !isValid;
    
    return isValid;
}

// Вспомогательные функции
function getBonusValues(bonusId, maxLevel) {
    const enabled = document.getElementById(`enable${bonusId}Bonus`).checked;
    if (!enabled) return null;
    
    const values = [];
    for (let level = 1; level <= maxLevel; level++) {
        const input = document.getElementById(`bonus${bonusId}_${level}`);
        if (input) values.push(input.value || "0");
    }
    return values.join(' ');
}

// Генерация KV кода
function generateItemCode(level, itemName, itemCost, maxLevel) {
    const fullItemName = level === 1 ? `item_${itemName}_custom` : `item_${itemName}_custom_${level}`;
    const baseItemName = `item_${itemName}_custom`;
    
    let kvCode = `"${fullItemName}"\n{\n`;
    kvCode += `    // General\n    //-------------------------------------------------------------------------------------------------------------\n`;
    kvCode += `    "BaseClass" "item_lua"\n    "ScriptFile" "items/${baseItemName}"\n`;
    kvCode += `    "AbilityTextureName" "tome_of_knowledge"\n    "Model" "models/props_gameplay/neutral_box.vmdl"\n`;
    kvCode += `    "AbilityBehavior" "DOTA_ABILITY_BEHAVIOR_PASSIVE"\n`;
    
    kvCode += `    // Item Info\n    //-------------------------------------------------------------------------------------------------------------\n`;
    kvCode += `    "ItemCost" "${itemCost}"\n    "ItemBaseLevel" "${level}"\n    "MaxUpgradeLevel" "${maxLevel}"\n`;
    kvCode += `    "ItemSellable" "${elements.itemSellable.checked ? "1" : "0"}"\n`;
    kvCode += `    "ItemPurchasable" "${elements.itemPurchasable.checked ? "1" : "0"}"\n`;
    
    if (elements.itemDroppable.checked) {
        kvCode += `    "ItemContributesToNetWorthWhenDropped" "0"\n`;
    }
    
    kvCode += `    // Special\n    //-------------------------------------------------------------------------------------------------------------\n    "AbilityValues"\n    {\n`;
    
    // Бонусы
    bonuses.forEach(bonus => {
        const bonusString = getBonusValues(bonus.id, maxLevel);
        if (bonusString && bonusString.split(' ').some(val => parseInt(val) !== 0)) {
            kvCode += `        "${bonus.key}" "${bonusString}"\n`;
        }
    });
    
    kvCode += `    }\n}`;
    return kvCode;
}

function generateRecipeCode(level, itemName) {
    const prevItem = level === 2 ? `item_${itemName}_custom` : `item_${itemName}_custom_${level-1}`;
    
    return `"item_recipe_${itemName}_custom_${level}"\n{\n    "BaseClass" "item_datadriven"\n    "Model" "models/props_gameplay/recipe.vmdl"\n    "ItemRecipe" "1"\n    "ItemResult" "item_${itemName}_custom_${level}"\n    "ItemRequirements"\n    {\n        "01" "${prevItem}"\n    }\n    // укажите свою стоимость рецепта. 0 = сам рецепт не учитывается при сборке предмета.\n    "ItemCost" "1"\n}`;
}

function generateKvCode() {
    const itemName = elements.itemName.value.trim();
    const itemCost = elements.itemCost.value;
    const itemMaxLevel = parseInt(elements.itemMaxLevel.value);
    
    let kvCode = "";
    
    if (itemMaxLevel === 1) {
        kvCode = generateItemCode(1, itemName, itemCost, itemMaxLevel);
    } else {
        const recipes = Array.from({length: itemMaxLevel - 1}, (_, i) => i + 2)
            .map(level => generateRecipeCode(level, itemName));
        
        const items = Array.from({length: itemMaxLevel}, (_, i) => i + 1)
            .map(level => generateItemCode(level, itemName, level === 1 ? itemCost : "0", itemMaxLevel));
        
        kvCode = recipes.join('\n\n') + '\n\n' + items.join('\n\n');
    }
    
    return kvCode;
}

// Генерация Lua кода
function generateLuaCode() {
    const itemName = elements.itemName.value.trim();
    const itemMaxLevel = parseInt(elements.itemMaxLevel.value);
    const baseItemName = `item_${itemName}_custom`;
    
    let luaCode = `-- Модификатор для предмета ${baseItemName}\n`;
    luaCode += `LinkLuaModifier("modifier_${baseItemName}", "items/${baseItemName}", LUA_MODIFIER_MOTION_NONE)\n\n`;
    
    // Объявление классов предметов
    if (itemMaxLevel === 1) {
        luaCode += `${baseItemName} = class({})\n\n`;
    } else {
        luaCode += `${baseItemName} = class({})\n`;
        for (let level = 2; level <= itemMaxLevel; level++) {
            luaCode += `${baseItemName}_${level} = ${baseItemName} or class({})\n`;
        }
        luaCode += '\n';
    }
    
    // Функция получения модификатора
    luaCode += `function ${baseItemName}:GetIntrinsicModifierName()\n`;
    luaCode += `    return "modifier_${baseItemName}"\n`;
    luaCode += `end\n\n`;
    
    // Функция получения текстуры
    luaCode += `function ${baseItemName}:GetAbilityTextureName()\n`;
    luaCode += `    return "tome_of_knowledge" -- Замените на нужную текстуру\n`;
    luaCode += `end\n\n`;
    
    // Объявление модификатора
    luaCode += `modifier_${baseItemName} = class({})\n\n`;
    
    // Функции модификатора
    luaCode += `function modifier_${baseItemName}:IsHidden()\n`;
    luaCode += `    return true\n`;
    luaCode += `end\n\n`;
    
    luaCode += `function modifier_${baseItemName}:IsPurgable()\n`;
    luaCode += `    return false\n`;
    luaCode += `end\n\n`;
    
    luaCode += `function modifier_${baseItemName}:RemoveOnDeath()\n`;
    luaCode += `    return false\n`;
    luaCode += `end\n\n`;
    
    luaCode += `function modifier_${baseItemName}:GetAttributes()\n`;
    luaCode += `    return MODIFIER_ATTRIBUTE_PERMANENT\n`;
    luaCode += `end\n\n`;
    
    // DeclareFunctions
    const activeBonuses = bonuses.filter(bonus => 
        document.getElementById(`enable${bonus.id}Bonus`).checked
    );
    
    luaCode += `function modifier_${baseItemName}:DeclareFunctions()\n`;
    luaCode += `    return {\n`;
    
    activeBonuses.forEach((bonus, index) => {
        luaCode += `        ${bonus.modifier}`;
        if (index < activeBonuses.length - 1) luaCode += ',';
        luaCode += '\n';
    });
    
    luaCode += `    }\n`;
    luaCode += `end\n\n`;
    
    // Функции получения бонусов
    activeBonuses.forEach(bonus => {
        luaCode += `function modifier_${baseItemName}:${bonus.function}()\n`;
        luaCode += `    return self:GetAbility():GetSpecialValueFor("${bonus.key}")\n`;
        luaCode += `end\n\n`;
    });
    
    return luaCode;
}

// Основная функция генерации
function generateCode() {
    if (!validateForm()) return;
    
    const kvCode = generateKvCode();
    const luaCode = generateLuaCode();
    
    elements.kvOutput.textContent = kvCode;
    elements.luaOutput.textContent = luaCode;
    
    elements.downloadKvBtn.disabled = false;
    elements.downloadLuaBtn.disabled = false;
}

function downloadFile(type) {
    const itemName = elements.itemName.value.trim();
    let content, filename;
    
    if (type === 'kv') {
        content = elements.kvOutput.textContent;
        filename = `item_${itemName}_custom.txt`;
    } else {
        content = elements.luaOutput.textContent;
        filename = `item_${itemName}_custom.lua`;
    }
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Запуск
document.addEventListener('DOMContentLoaded', init);