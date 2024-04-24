  GNU nano 6.2                                                                                       backup.sh                                                                                                 
#!/bin/bash

# Configuración de las rutas y bases de datos
REPO_PATH="home/ubuntu/Service/NasalmiServicioWeb/"
DB_BACKUP_PATH="$REPO_PATH/db_backups"
DB_NAME="Nasalmi"
DATE=$(date +%Y%m%d_%H%M%S)

# Crea un directorio para los backups de la base de datos si no existe
mkdir -p $DB_BACKUP_PATH

# Backup de la base de datos MongoDB
mongodump --db $DB_NAME --out $DB_BACKUP_PATH/$DATE

# Navega al repositorio
cd $REPO_PATH

# Añade todos los nuevos archivos y cambios al stage
git add .

# Realiza un commit
git commit -m "Automatic backup on $DATE"

/home/ubuntu/Service/NasalmiServicioWeb/pass.sh





