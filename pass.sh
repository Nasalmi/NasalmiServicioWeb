#!/usr/bin/expect

# Define la ruta al repositorio
set timeout -1
set repo_path "/home/ubuntu/Servicio/NasalmiServicioWeb/"

# Define la contraseña
set password "almi123"


# Ejecuta git push y maneja la interacción esperada
spawn git push
expect "Enter passphrase for key '/home/ubuntu/.ssh/id_ed25519':"
send "$password\r"
expect eof
