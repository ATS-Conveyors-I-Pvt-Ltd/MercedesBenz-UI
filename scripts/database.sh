#!/bin/bash

# Mercedes-Benz MS SQL Server Docker Management Script
# This script helps manage the SQL Server Docker container

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CONTAINER_NAME="mercedes-benz-mssql"
SA_PASSWORD="MercedesBenz2026!"
DB_NAME="mercedes_benz_db"

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check if Docker is running
check_docker() {
    print_info "Checking if Docker is running..."
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker Desktop."
        exit 1
    fi
    print_success "Docker is running"
}

# Function to start SQL Server container
start_container() {
    print_info "Starting SQL Server container..."
    docker-compose up -d
    
    print_info "Waiting for SQL Server to be ready..."
    sleep 10
    
    # Wait for health check
    for i in {1..30}; do
        if docker exec $CONTAINER_NAME /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -Q "SELECT 1" > /dev/null 2>&1; then
            print_success "SQL Server is ready!"
            return 0
        fi
        echo -n "."
        sleep 2
    done
    
    print_error "SQL Server failed to start"
    exit 1
}

# Function to stop container
stop_container() {
    print_info "Stopping SQL Server container..."
    docker-compose down
    print_success "Container stopped"
}

# Function to check logical file names in backup
check_backup() {
    print_info "Checking backup file for logical names..."
    docker exec $CONTAINER_NAME /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" \
        -Q "RESTORE FILELISTONLY FROM DISK = '/database/mb_db.bak';"
}

# Function to restore database
restore_database() {
    print_info "Restoring database from backup..."
    
    # First, get the logical file names
    print_info "Getting logical file names from backup..."
    FILELISTONLY=$(docker exec $CONTAINER_NAME /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" \
        -Q "RESTORE FILELISTONLY FROM DISK = '/database/mb_db.bak';" -h -1)
    
    # Extract logical names (first column)
    LOGICAL_DATA=$(echo "$FILELISTONLY" | awk 'NR==1 {print $1}')
    LOGICAL_LOG=$(echo "$FILELISTONLY" | awk 'NR==2 {print $1}')
    
    print_info "Data file: $LOGICAL_DATA"
    print_info "Log file: $LOGICAL_LOG"
    
    # Build restore command dynamically
    RESTORE_CMD="RESTORE DATABASE $DB_NAME FROM DISK = '/database/mb_db.bak' WITH MOVE '$LOGICAL_DATA' TO '/var/opt/mssql/data/${DB_NAME}.mdf', MOVE '$LOGICAL_LOG' TO '/var/opt/mssql/data/${DB_NAME}_log.ldf', REPLACE;"
    
    print_info "Executing restore..."
    docker exec $CONTAINER_NAME /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" \
        -Q "$RESTORE_CMD"
    
    print_success "Database restored successfully!"
}

# Function to test connection
test_connection() {
    print_info "Testing database connection..."
    docker exec $CONTAINER_NAME /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" \
        -d $DB_NAME -Q "SELECT @@VERSION; SELECT DB_NAME() AS CurrentDatabase;"
    
    print_success "Connection test successful!"
}

# Function to list databases
list_databases() {
    print_info "Listing all databases..."
    docker exec $CONTAINER_NAME /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" \
        -Q "SELECT name, database_id, create_date FROM sys.databases;"
}

# Function to show container status
show_status() {
    print_info "Container status:"
    docker ps -a | grep $CONTAINER_NAME || print_warning "Container not found"
    
    print_info "\nContainer logs (last 20 lines):"
    docker logs --tail 20 $CONTAINER_NAME 2>&1 || print_warning "Could not fetch logs"
}

# Function to open SQL shell
sql_shell() {
    print_info "Opening SQL shell..."
    print_info "Type 'exit' or press Ctrl+D to exit"
    docker exec -it $CONTAINER_NAME /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -d $DB_NAME
}

# Function to show help
show_help() {
    echo "Mercedes-Benz MS SQL Server Docker Management"
    echo "=============================================="
    echo ""
    echo "Usage: ./scripts/database.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start       - Start SQL Server container"
    echo "  stop        - Stop SQL Server container"
    echo "  restart     - Restart SQL Server container"
    echo "  restore     - Restore database from backup"
    echo "  test        - Test database connection"
    echo "  check       - Check backup file contents"
    echo "  status      - Show container status and logs"
    echo "  list        - List all databases"
    echo "  shell       - Open SQL command shell"
    echo "  setup       - Full setup (start + restore + test)"
    echo "  help        - Show this help message"
    echo ""
}

# Main script logic
case "${1:-help}" in
    start)
        check_docker
        start_container
        ;;
    stop)
        stop_container
        ;;
    restart)
        stop_container
        sleep 2
        start_container
        ;;
    restore)
        check_docker
        restore_database
        ;;
    test)
        check_docker
        test_connection
        ;;
    check)
        check_docker
        check_backup
        ;;
    status)
        show_status
        ;;
    list)
        check_docker
        list_databases
        ;;
    shell)
        check_docker
        sql_shell
        ;;
    setup)
        echo "🚀 Mercedes-Benz Database Setup"
        echo "================================"
        echo ""
        check_docker
        start_container
        echo ""
        restore_database
        echo ""
        test_connection
        echo ""
        print_success "Database setup complete!"
        print_info "Connection details:"
        echo "  Host: localhost"
        echo "  Port: 1433"
        echo "  Database: $DB_NAME"
        echo "  Username: sa"
        echo "  Password: $SA_PASSWORD"
        ;;
    help|*)
        show_help
        ;;
esac
