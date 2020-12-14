////////////////////////////////////--------\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// --- 1234567898765432123456789 --- LOGIN ---  9876543212345678987654321 --- \\
function login() {
    $.ajax({
        url: "/login",
        type: "POST",
        async: false,
        data: {password: $(".pw").val()},
        success: function (data, textStatus, jqXHR) {
            if ($(".pw").val() == data) { window.location.replace('/map'); }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
}

$(".buttonLogin").on("click", login);




// $.ajax({
//     url: "/login",
//     type: "POST",
//     async: false,
//     data: {password: "y1jD3r"},
//     success: function (data, textStatus, jqXHR) {
//         window.location.replace('/map'); 
//     },
//     error: function (jqXHR, textStatus, errorThrown) {
//         console.log(errorThrown);
//     }
// });