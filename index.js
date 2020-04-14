const express = require("express");

const app = express();
// создаем парсер для данных в формате json
const jsonParser = express.json();

app.use(express.static(__dirname + "/public"));

app.post("/grammar", jsonParser, function (request, response) {
    if(!request.body) return response.sendStatus(400);

    let resp = mainAlgorythm(request.body);
    response.json(resp);
});

app.get("/", function(request, response){

    response.sendFile(__dirname + "/index.html");
});

app.listen(3000);

function grammarNode(text, lvl, par){
    this.text = {
        name: text
    };
    this.lvl = lvl;
    this.par =  par;
    this.isFull = false;
}

function mainAlgorythm(data){
    let terminals = parseVT_VN(data.terminals),
        noTerminals = parseVT_VN(data.noTerminals),
        targetSymbol = data.targetSymbol,
        rules = data.rules;

    if(terminals === null){
        return {
            success: false,
            msg: "Нет ни одного терминального символа, пустая грамматика"
        };
    }

    if(targetSymbol === 'no'){
        return  {
            success: false,
            msg: "Не задан целевой символ"
        };
    }

    let targetHasRule = false;

    for(let i = 0; i < rules.length; i++){
        let leftPart = rules[i].replace(/->.+$/, '');
        if(leftPart.indexOf(targetSymbol) !== -1){
            targetHasRule = true;
        }
    }

    if(!targetHasRule){
        return  {
            success: false,
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
            success: false,
            msg: "Множества терминалов и нетерминалов не должны пересекаться"
        };
    }

    //проверяем правильность задания грамматики

    let areRulesCorrect = true;

    for(let i = 0; i < noTerminals.length; i++){
        let hasCorrectRule = false;

        for(let j = 0; j < rules.length; j++){
            let leftPart = rules[j].replace(/->.+$/, ''),
                rightPart = rules[j].replace(/^.+->/, ''),
                contains = leftPart.match(noTerminals[i]) !== null;


            if(contains){
                hasCorrectRule = true;
            }

            //Правила для терминалов
            for(let k = 0; k < terminals.length; k++){
                let regex = new RegExp(terminals[k].replace('+', '\\+'));
                if(leftPart.match(regex) !== null && rightPart.match(regex) === null){
                    areRulesCorrect = false;
                }
            }
        }

        if(!hasCorrectRule && areRulesCorrect){
            areRulesCorrect = false;
        }
    }

    if(!areRulesCorrect){
        return {
            success: false,
            msg: "Для каждого нетерминального символа должно быть хотя бы одно правило, содержащее его в левой части. Если в левой части содержится терминальный символ, то в правой части он тоже должен содержаться"
        };
    }

    let verifiedRules = [];

    for(let i = 0; i < rules.length; ++i){
        if(rules[i].indexOf('|') !== -1){
            let rightPart = rules[i].replace(/^.+->/, ''),
                leftPart = rules[i].replace(/->.+$/, ''),
                arrayRules = rightPart.split('|');

            if(arrayRules.length !== 0){
                arrayRules.forEach(function (el) {
                    verifiedRules.push(leftPart + '->' + el);
                });
            }
        } else{
            verifiedRules.push(rules[i]);
        }
    }

    let nodeStructure = {
            root: new grammarNode(targetSymbol, 1, null)
        },

        currentSymbol = nodeStructure.root;

    while(!nodeStructure.root.isFull){
        let currentSymInVN = false;
        noTerminals.forEach(function (el) {
            if(currentSymbol.text.name.indexOf(el) !== -1){
                currentSymInVN = el;
            }
        });

        if(currentSymbol.lvl < 5 && currentSymInVN){

            if(currentSymbol.children !== undefined){
                let emptyChild = null;

                for(let i = 0; i < currentSymbol.children.length; ++i){
                    if(!currentSymbol.children[i].isFull){
                        emptyChild = currentSymbol.children[i];
                    }
                }

                if(emptyChild !== null){
                    currentSymbol = emptyChild;
                } else{
                    currentSymbol.isFull = true;
                    let link = currentSymbol;
                    currentSymbol = currentSymbol.par;
                    delete link.par;
                }
            } else{

                verifiedRules.forEach(function (el) {
                    let leftPart = el.replace(/->.+$/, '');

                    if(leftPart.indexOf(currentSymInVN) !== -1){
                        if(currentSymbol.children !== undefined){
                            currentSymbol.children.push(new grammarNode(currentSymbol.text.name.replace(currentSymInVN, el.replace(/^.+->/, '')), currentSymbol.lvl + 1, currentSymbol))
                        } else{
                            currentSymbol.children = [new grammarNode(currentSymbol.text.name.replace(currentSymInVN, el.replace(/^.+->/, '')), currentSymbol.lvl + 1, currentSymbol)]
                        }
                    }
                });
            }
        } else{
            currentSymbol.isFull = true;
            let link = currentSymbol;
            currentSymbol = currentSymbol.par;
            delete link.par;
        }
    }

    nodeStructure.success = true;
    return nodeStructure;
}

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
