// var rulesCount = 1,
//     rulesBlock = document.querySelector('.rule-block');
//
// document.addEventListener('DOMContentLoaded', function () {
//
//     /**
//      * todo: раскомментировать на продакшн
//      */
//     // let grammarForm = document.forms["grammarForm"];
//     // grammarForm.reset();
//
//     document.querySelector('i.rule-control.delete').addEventListener('click', function (el) {
//         deleteRule(el);
//     });
//
//     document.querySelector('i.rule-control.add').addEventListener('click', function () {
//         ++rulesCount;
//         var newRule = document.createElement('div');
//         newRule.classList.add('rule-'+rulesCount);
//         newRule.innerHTML = '<input type="text" name="rule'+rulesCount+'" /><i title="Удалить правило" class="fa fa-trash delete rule-control" aria-hidden="true"></i>';
//         newRule.querySelector('.delete').addEventListener('click', function (el) {
//             deleteRule(el);
//         });
//         rulesBlock.appendChild(newRule);
//     });
//
//     document.querySelector('input[name="vn"]').addEventListener('change', function (el) {
//         changeTargetSymbol(el.target.value);
//     });
// });
//
// /**
//  * Функция для удаления правила
//  * @param el
//  */
// function deleteRule(el){
//     el.target.parentNode.remove();
//     --rulesCount;
// }
//
// /**
//  * При изменении значения в поле нетерминальных символов перестраиваем селект с целевым символом
//  * @param value
//  * @returns {boolean}
//  */
// function changeTargetSymbol(value){
//     if(value === ''){
//         return false;
//     }
//
//     value = value.replace(' ', '');
//     var symbols = value.split(',');
//
//     var selectList = document.querySelector('select[name="s"]');
//     selectList.querySelectorAll('option').forEach(function (el) {
//         el.remove();
//     });
//
//     symbols.forEach(function (el) {
//         var option = document.createElement('option');
//         option.value = el;
//         option.innerHTML = el;
//         selectList.appendChild(option);
//     });
// }
//
// document.getElementById("submit").addEventListener("click", function (e) {
//     e.preventDefault();
//     // получаем данные формы
//     let grammarForm = document.forms["grammarForm"].elements,
//         data = {
//             terminals: grammarForm['vt'].value,
//             noTerminals: grammarForm['vn'].value,
//             targetSymbol: grammarForm['s'].value,
//             rules: []
//         };
//
//     for(var i = 1; i <= rulesCount; i++){
//         data.rules.push(grammarForm['rule'+i].value);
//     }
//
//     let preparedData = JSON.stringify(data);
//     let request = new XMLHttpRequest();
//     // посылаем запрос на адрес "/user"
//     request.open("POST", "/grammar", true);
//     request.setRequestHeader("Content-Type", "application/json");
//     request.addEventListener("load", function () {
//         // получаем и парсим ответ сервера
//         let response = JSON.parse(request.response);
//         console.log('response');   // смотрим ответ сервера
//         console.log(response);   // смотрим ответ сервера
//     });
//     request.send(preparedData);
// });

/**
 * todo: ВОЗВРАЩАЕТ UNDEFINED
 */

var data = {
    noTerminals: "a, s",
    targetSymbol: "a",
    terminals: "A, {{},B, C",
    rules: [
        "a->Cs",
        "s->A|B"
    ]
};

function mainAlgorythm(data){
    let terminals = parseVT_VN(data.terminals),
        noTerminals = parseVT_VN(data.noTerminals),
        targetSymbol = data.targetSymbol,
        rules = data.rules;

    if(terminals === null){
        return {
            status: 'error',
            msg: "Нет ни одного терминального символа, пустая грамматика"
        };
    }

    if(targetSymbol === 'no'){
        return  {
            status: 'error',
            msg: "Не задан целевой символ"
        };
    }

    let regex = new RegExp('^' + targetSymbol + '\\->');

    let targetHasRule = false;

    for(let i = 0; i < rules.length; i++){
        if(rules[i].match(regex) !== null){
            targetHasRule = true;
        }
    }

    if(!targetHasRule){
        return  {
            status: 'error',
            msg: "Для целевого символа не задано правило"
        };
    }

    //проверка на пересечение множеств терминалов и нетерминалов
    let areCrossed = false;

    if(terminals.length !== 0 && noTerminals.length !== 0){
        for (let i = 0; i < terminals.length; i++){
            for(let j = 0; j<noTerminals.length; j++){
                if(terminals[i] === noTerminals[j]) areCrossed = true;
            }
        }
    }

    if(areCrossed){
        return  {
            status: 'error',
            msg: "Множества терминалов и нетерминалов не должны пересекаться"
        };
    }
}

console.log(mainAlgorythm(data));

/**
 * Разбор терминальных и нетерминальных символов на тот случай, если запятая или фигурная скобка тоже является терминальным символом
 * @param str
 * @returns {*|string[]}
 */
function parseVT_VN(str) {
    let result = [];

    if(str === '') return null;

    if(str.match(/{|}/) !== null){

        let element = '',
            ignoreControls = false;

        for (let i = 0; i < str.length; i++) {
            if (str[i] === '{' && !ignoreControls) {
                ignoreControls = true;
            } else if (str[i] === '}' && str[i+1] !== '}') {
                ignoreControls = false;
            } else if(ignoreControls || str[i] !== ','){
                element += str[i];
            } else{
                result.push(element.replace(' ', ''));
                element = '';
            }
        }
    } else{
        result = str.replace(' ', '').split(',');
    }

    return result;
}
