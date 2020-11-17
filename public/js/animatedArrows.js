function animateArrows(img) {
    getJSON(`models/${field.model}/${field.field}/json/${field.model}_${field.field}.json`, function (windData) {
        windData.image = img;
        wind.setWind(windData);
    });


    function getJSON(url, callback) {
        const xhr = new XMLHttpRequest();
        xhr.responseType = 'json';
        xhr.open('get', url, true);
        xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 300) {
                callback(xhr.response);
            } else {
                throw new Error(xhr.statusText);
            }
        };
        xhr.send();
    }
}