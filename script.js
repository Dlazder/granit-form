const form = document.querySelector('form');
const values = [
    ['Заголовок:', 'header'],
    ['Размер площадки:', 'areaSize'],
    ['Плитка:', 'tile'],
    ['Размер плитки:', 'tileSize'],
    ['Плитка (Относительно входа) Вдоль/поперек?', 'tileRelation'],
    ['Размер памятника:', 'stoneSize'],
    ['Цвет камня:', 'stoneColor'],
    ['Размер цветника:', 'parterreSize'],
    ['Размер вазы:', 'vaseSize'],
    ['ФИО:', 'fullName'],
    ['Даты:', 'dates'],
    ['(Тип или название) шрифта:', 'fontFamily'],
    ['Цвет шрифта:', 'fontColor'],
    ['Размер подставки под камень:', 'underStoneSize'],
    ['Размер креста:', 'crossSize'],
    ['Размер проставки:', 'spacerSize'],
    ['Размер столбов:', 'postSize'],
    ['Кол-во cтолбов:', 'postCount'],
    ['Тип надгробной плиты:', 'tombstoneType'],
    ['Размер надгробной плиты:', 'tombstoneSize'],
    ['Имена файлов:', 'fileNames']
];
// render default inputs and text
values.forEach((e, i) => {
    form.innerHTML += `<p>${e[0]}</p>
    <input type="text"><br>`;
})
form.innerHTML += `
Описание деталей:<br><br>
<textarea rows="10" cols="40"></textarea>
<div class="file-form">
<p>Чтобы загрузить файлы перетащите их в эту область или нажмите на прямоугольник. Все необходимые файлы необходимо выбирать сразу же зажав Ctrl на пк, или зажав пальцем на телкфоне</p>
    <input type="file" multiple>
</div>
`;
form.innerHTML += '<button id="send">Отправить</button>';
// Hide input "fileNames"
document.querySelector('p:last-of-type').classList.add('hidden');
document.querySelector('input:last-of-type').classList.add('hidden');

let data = {};
values.forEach(e => {data[e]});
let inputs = Array.from(document.querySelectorAll('input[type="text"]'));
// remove hiden input from nodeList
inputs.pop()
inputs.forEach(e => {e.addEventListener('change', createData)});

window.onload = loadOrders;

function loadOrders() {
    const orders = document.querySelector('.orders')
    let ordersData;
    let imagesSrc = [];
    fetch('data.json')
    .then(responce => responce.json())
    .then(responce => ordersData = responce)
    .catch(err => console.warn(err))
    .finally(renderList);

    function renderList() {
        let html = '<h1>Granit form</h1>';
        if (ordersData !== undefined) {
            ordersData.forEach((e, i) => {
                if (e.fileNames) {
                    imagesSrc = e.fileNames.split(',');
                }
                
                html += `
                <div class="order__item">
                    <div class="order__item-header">
                        <h2>${e.header}</h2>
                        <div class="btns">
                            <button class="unwrapBtn"></button>
                            <button class="remove">Удалить</button>
                        </div>
                    </div>
                    <div class="properties hidden">
                        ${values.map((element, index) => {return `<p>${element[0]} <span class="mark">${Object.values(e)[index]}</span></p>`}).join('')}
                        Описание: ${e.description}
                        <div class="images">
                            ${imagesSrc.map((e) => {return `<img src="/images/${e}">`}).join('')}
                        </div>
                    </div>
                </div>`;
            });
            html += '<button id="createNew">Создать новый</button>';
            orders.innerHTML = html;
            addListeners()
        } else {
            html += '<button id="createNew">Создать новый</button>';
            orders.innerHTML = html;
            addListeners()
        }
        // Удаляем повторяющееся свойство заголовка в каждом заказе
        document.querySelectorAll('.properties').forEach((e) => {e.querySelector('p').remove()})
        // Remove flieNa,es from order__item
        document.querySelectorAll('.order__item .properties').forEach(e => e.querySelector('p:last-of-type').remove())
    }

    function addListeners() {
        let removeBtns = document.querySelectorAll('.remove');
        let unwrapBtns = document.querySelectorAll('.unwrapBtn');
        let properties = document.querySelectorAll('.properties');
        let order__items = document.querySelectorAll('.order__item');
        removeBtns.forEach((e, i) => {
            e.addEventListener('click', () => {
                order__items[i].remove();
                
                fetch('data.json')
                .then(res => res.json())
                .then(res => res.filter((_, index) => index !== i))
                .then(res => fetch('/data', {method: 'POST', body: JSON.stringify(res)}))
                .then(() => location.reload())
                .catch(err => console.error(err))
            })
        })
        unwrapBtns.forEach((e, i) => {
            e.addEventListener('click', () => {
                e.classList.toggle('unwrapBtn--active');
                order__items[i].classList.toggle('unwrap');
                properties[i].classList.toggle('hidden');
            })
        })
        document.querySelector('#createNew').onclick = () => {
            document.querySelector('.orders').classList.add('hidden');
            document.querySelector('form').classList.remove('hidden');
        }
    }
}

function createData() {
    for (let i = 0; i < inputs.length; i++) {
        data[values[i][1]] = inputs[i].value;
    }
}

document.querySelector('#send').addEventListener('click', (e) => {
    e.preventDefault()
    let responceText = [];
    fetch('data.json')
    .then(res => res.json())
    .then(res => responceText = res)
    .then(res => send())
    .catch(err => console.warn(err));

    function send() {
        // inputs validation
        let isNull = false;
        for (let i = 0; i< inputs.length; i++) {
            if (!inputs[i].value) {
                alert(`Не все поля заполнены! Заполните поле №${i+1}`);
                isNull = true;
                break;
            }
        }
        if (!isNull) {responceText.push(data)
        fetch('/data', {method: 'POST', body: JSON.stringify(responceText)})
        .then(location.reload())
        }
    }
});


// add textarea value in data
const textarea = document.querySelector('textarea').addEventListener('input', e => {
    data.description = e.target.value;
})



const fileInput = document.querySelector('input[type="file"]');

function uploadFile(e) {
    e.preventDefault();
    let images = [];
    let fileNames = [];

    for (let i = 0; i < fileInput.files.length; i++) {
        const file = fileInput.files[i];
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = () => {
            const base64Image = reader.result.split(',')[1];
            const fileName = file.name;
            images.push({base64Image, fileName});
            fileNames.push(fileName);
            document.querySelector('input:last-of-type').value = fileNames;
            data.fileNames = document.querySelector('input:last-of-type').value;

            fetch('/file', {method: 'POST',
            body: JSON.stringify({fileName, base64Image})})
            .then(res => alert(`Выбранные вами файлы (${i}) успешно загруженны!`))
            .catch(err => console.error(err));
        }

    }
}

fileInput.addEventListener('change', uploadFile);