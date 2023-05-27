let json = '[{"header":"Заказ","type":"1"},{"header":"Заказ 2","type":"2"},{"header":"Заказ 3","type":"3"}]';

json = JSON.parse(json);
json = json.filter((_, i) => i !== 1)

console.log(json);