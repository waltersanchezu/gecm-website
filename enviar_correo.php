<?php
header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = strip_tags(trim($_POST["name"]));
    $company = strip_tags(trim($_POST["company"]));
    $email = filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL);
    $phone = strip_tags(trim($_POST["phone"]));
    $service = strip_tags(trim($_POST["service"]));
    $message = trim($_POST["message"]);
    $captcha = trim($_POST["captcha"]);
    $captcha_expected = trim($_POST["captcha_expected"]);

    // Basic validations
    if (empty($name) || empty($email) || empty($message) || empty($captcha) || empty($captcha_expected)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Por favor, complete todos los campos obligatorios."]);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "El correo electrónico no es válido."]);
        exit;
    }

    if ($captcha !== $captcha_expected) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "El código CAPTCHA (suma) es incorrecto."]);
        exit;
    }

    $recipient = "info@gecmconsulting.com";
    $subject = "Nuevo mensaje de contacto desde GECM Consulting - $name";

    $email_content = "Has recibido un nuevo mensaje desde el formulario de contacto de GECM Consulting.\n\n";
    $email_content .= "Nombre: $name\n";
    $email_content .= "Empresa: $company\n";
    $email_content .= "Correo: $email\n";
    $email_content .= "Teléfono: $phone\n";
    $email_content .= "Servicio de interés: $service\n\n";
    $email_content .= "Mensaje:\n$message\n";

    $email_headers = "From: $name <$email>\r\n";
    $email_headers .= "Reply-To: $email\r\n";
    $email_headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    if (mail($recipient, $subject, $email_content, $email_headers)) {
        http_response_code(200);
        echo json_encode(["status" => "success", "message" => "¡Gracias! Tu mensaje ha sido enviado."]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Oops! Algo salió mal y no pudimos enviar tu mensaje."]);
    }
} else {
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "Hubo un problema con tu envío, intenta nuevamente."]);
}
?>
