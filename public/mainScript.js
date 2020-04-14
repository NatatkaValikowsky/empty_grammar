var rulesCount = 3,
    rulesBlock = document.querySelector('.rule-block');

document.addEventListener('DOMContentLoaded', function () {

    let grammarForm = document.forms["grammarForm"];
    grammarForm.reset();

    document.querySelectorAll('i.rule-control.delete').forEach(function (element) {
        element.addEventListener('click', function (e) {
            deleteRule(e);
        });
    });

    document.querySelector('i.rule-control.add').addEventListener('click', function () {
        ++rulesCount;
        var newRule = document.createElement('div');
        newRule.classList.add('rule-'+rulesCount);
        newRule.innerHTML = '<input type="text" name="rule'+rulesCount+'" /><i title="Удалить правило" class="fa fa-trash delete rule-control" aria-hidden="true"></i>';
        newRule.querySelector('.delete').addEventListener('click', function (el) {
            deleteRule(el);
        });
        rulesBlock.appendChild(newRule);
    });

    document.querySelector('input[name="vn"]').addEventListener('change', function (el) {
        changeTargetSymbol(el.target.value);
    });
});

/**
 * Функция для удаления правила
 * @param el
 */
function deleteRule(el){
    el.target.parentNode.remove();
    --rulesCount;
}

/**
 * При изменении значения в поле нетерминальных символов перестраиваем селект с целевым символом
 * @param value
 * @returns {boolean}
 */
function changeTargetSymbol(value){
    if(value === ''){
        return false;
    }

    value = value.replace(' ', '');
    var symbols = value.split(',');

    var selectList = document.querySelector('select[name="s"]');
    selectList.querySelectorAll('option').forEach(function (el) {
        el.remove();
    });

    symbols.forEach(function (el) {
        var option = document.createElement('option');
        option.value = el;
        option.innerHTML = el;
        selectList.appendChild(option);
    });
}

document.getElementById("submit").addEventListener("click", function (e) {
    e.preventDefault();
    // получаем данные формы
    let grammarForm = document.forms["grammarForm"].elements,
        data = {
            terminals: grammarForm['vt'].value,
            noTerminals: grammarForm['vn'].value,
            targetSymbol: grammarForm['s'].value,
            rules: []
        };

    let addedCount = 0,
        index = 1;

    while(addedCount < rulesCount){
        if(grammarForm['rule'+index] !== undefined){
            data.rules.push(grammarForm['rule'+index].value);
            addedCount++;
        }
        index++;
    }

    let preparedData = JSON.stringify(data);
    let request = new XMLHttpRequest();
    // посылаем запрос на адрес "/user"
    request.open("POST", "/grammar", true);
    request.setRequestHeader("Content-Type", "application/json");
    request.addEventListener("load", function () {

        document.querySelector('.status').innerHTML = '';

        // получаем и парсим ответ сервера
        let response = JSON.parse(request.response);

        if(!response.success){
            alert(response.msg);
        } else{
            document.querySelector('.status').innerHTML = 'Грамматика является не пустой';
            let tree = {
                chart: {
                    container: "#tree-result",
                    rootOrientation: "WEST"
                },

                nodeStructure: response.root
            };

            new Treant( tree );
        }

    });
    request.send(preparedData);
});
