document.getElementById("submit").addEventListener("click", function (e) {
    e.preventDefault();
    // получаем данные формы
    let registerForm = document.forms["registerForm"];
    let userName = registerForm.elements["userName"].value;
    let userAge = registerForm.elements["userAge"].value;
    // сериализуем данные в json
    let user = JSON.stringify({userName: userName, userAge: userAge});
    let request = new XMLHttpRequest();
    // посылаем запрос на адрес "/user"
    request.open("POST", "/user", true);
    request.setRequestHeader("Content-Type", "application/json");
    request.addEventListener("load", function () {
        // получаем и парсим ответ сервера
        let receivedUser = JSON.parse(request.response);
        console.log(receivedUser.userName, "-", receivedUser.userAge);   // смотрим ответ сервера
    });
    request.send(user);
});

console.log(111);