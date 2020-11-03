////////////////////////////////////--------\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// --- 1234567898765432123456789 --- LOGIN ---  9876543212345678987654321 --- \\
function login() {
    if (($("#loginDropdown").dropdown('get text') == "MUN Gliders Group" && $(".pw").val() == "y1jD3r") ||
        ($("#loginDropdown").dropdown('get text') == "Guest" && $(".pw").val() == "_UJv;M8Rd]^[MBdU")) {
        // --- Set password
        $.ajax({
            url: "/setPassword",
            type: "POST",
            success: function (data, textStatus, jqXHR) {
                window.location.replace('/map');
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        });
    } else {
        // ---  Wrong password
        $(".pw").val('');
    }
}

$(".buttonLogin").on("click", login);
