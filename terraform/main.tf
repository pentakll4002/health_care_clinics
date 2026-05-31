# ============================================================
# Terraform - Main Infrastructure (Azure)
# Resources: Resource Group, ACR, Container Apps Environment,
#            PostgreSQL Flexible Server, Container Apps
# ============================================================

locals {
  resource_prefix = "${var.project_name}-${var.environment}"
  # ACR name must be alphanumeric only
  acr_name = replace("${var.project_name}${var.environment}acr", "-", "")
  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

# ---- Resource Group ----
resource "azurerm_resource_group" "main" {
  name     = "${local.resource_prefix}-rg"
  location = var.location
  tags     = local.tags
}

# ---- Azure Container Registry ----
resource "azurerm_container_registry" "acr" {
  name                = local.acr_name
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = "Basic"
  admin_enabled       = true
  tags                = local.tags
}

# ---- Log Analytics Workspace (for Container Apps) ----
resource "azurerm_log_analytics_workspace" "main" {
  name                = "${local.resource_prefix}-logs"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
  tags                = local.tags
}

# ---- Container Apps Environment ----
resource "azurerm_container_app_environment" "main" {
  name                       = "${local.resource_prefix}-env"
  location                   = azurerm_resource_group.main.location
  resource_group_name        = azurerm_resource_group.main.name
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id
  tags                       = local.tags
}

# ---- PostgreSQL Flexible Server ----
resource "azurerm_postgresql_flexible_server" "main" {
  name                   = "${local.resource_prefix}-pgdb"
  resource_group_name    = azurerm_resource_group.main.name
  location               = azurerm_resource_group.main.location
  version                = "16"
  administrator_login    = var.postgres_user
  administrator_password = var.postgres_password
  storage_mb             = 32768
  sku_name               = "B_Standard_B1ms"
  zone                   = "1"
  tags                   = local.tags

  authentication {
    active_directory_auth_enabled = false
    password_auth_enabled         = true
  }
}

# Allow Azure services to access PostgreSQL
resource "azurerm_postgresql_flexible_server_firewall_rule" "allow_azure" {
  name             = "AllowAzureServices"
  server_id        = azurerm_postgresql_flexible_server.main.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

# Create the database
resource "azurerm_postgresql_flexible_server_database" "main" {
  name      = var.postgres_db
  server_id = azurerm_postgresql_flexible_server.main.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}

# ---- Container App: Backend ----
resource "azurerm_container_app" "backend" {
  name                         = "${local.resource_prefix}-backend"
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = azurerm_resource_group.main.name
  revision_mode                = "Single"
  tags                         = local.tags

  registry {
    server               = azurerm_container_registry.acr.login_server
    username             = azurerm_container_registry.acr.admin_username
    password_secret_name = "acr-password"
  }

  secret {
    name  = "acr-password"
    value = azurerm_container_registry.acr.admin_password
  }

  secret {
    name  = "db-password"
    value = var.postgres_password
  }

  secret {
    name  = "jwt-secret"
    value = var.jwt_secret
  }

  secret {
    name  = "mail-password"
    value = var.mail_password
  }

  template {
    min_replicas = 1
    max_replicas = 3

    container {
      name   = "backend"
      image  = "${azurerm_container_registry.acr.login_server}/health-clinics-backend:latest"
      cpu    = var.backend_cpu
      memory = var.backend_memory

      env {
        name  = "SPRING_PROFILES_ACTIVE"
        value = "docker"
      }
      env {
        name  = "SPRING_DATASOURCE_URL"
        value = "jdbc:postgresql://${azurerm_postgresql_flexible_server.main.fqdn}:5432/${var.postgres_db}?sslmode=require"
      }
      env {
        name  = "SPRING_DATASOURCE_USERNAME"
        value = var.postgres_user
      }
      env {
        name        = "SPRING_DATASOURCE_PASSWORD"
        secret_name = "db-password"
      }
      env {
        name        = "JWT_SECRET"
        secret_name = "jwt-secret"
      }
      env {
        name  = "SPRING_MAIL_USERNAME"
        value = var.mail_username
      }
      env {
        name        = "SPRING_MAIL_PASSWORD"
        secret_name = "mail-password"
      }
      env {
        name  = "JAVA_OPTS"
        value = "-Xmx512m -Xms256m"
      }
    }
  }

  ingress {
    external_enabled = false
    target_port      = 8080
    transport        = "http"

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }
}

# ---- Container App: AI Service ----
resource "azurerm_container_app" "ai_service" {
  name                         = "${local.resource_prefix}-ai-service"
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = azurerm_resource_group.main.name
  revision_mode                = "Single"
  tags                         = local.tags

  registry {
    server               = azurerm_container_registry.acr.login_server
    username             = azurerm_container_registry.acr.admin_username
    password_secret_name = "acr-password"
  }

  secret {
    name  = "acr-password"
    value = azurerm_container_registry.acr.admin_password
  }

  secret {
    name  = "groq-api-key"
    value = var.groq_api_key
  }

  secret {
    name  = "langchain-api-key"
    value = var.langchain_api_key
  }

  template {
    min_replicas = 1
    max_replicas = 2

    container {
      name   = "ai-service"
      image  = "${azurerm_container_registry.acr.login_server}/health-clinics-ai-service:latest"
      cpu    = var.ai_service_cpu
      memory = var.ai_service_memory

      env {
        name        = "GROQ_API_KEY"
        secret_name = "groq-api-key"
      }
      env {
        name        = "LANGCHAIN_API_KEY"
        secret_name = "langchain-api-key"
      }
      env {
        name  = "MODEL_TYPE"
        value = "groq"
      }
      env {
        name  = "GROQ_MODEL"
        value = "openai/gpt-oss-120b"
      }
      env {
        name  = "GROQ_TIMEOUT"
        value = "120"
      }
      env {
        name  = "LANGCHAIN_TRACING_V2"
        value = "true"
      }
      env {
        name  = "LANGCHAIN_PROJECT"
        value = "nt118-chatbot"
      }
      env {
        name  = "BACKEND_URL"
        value = "http://${azurerm_container_app.backend.name}/api"
      }
    }
  }

  ingress {
    external_enabled = false
    target_port      = 8000
    transport        = "http"

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }
}

# ---- Container App: Frontend ----
resource "azurerm_container_app" "frontend" {
  name                         = "${local.resource_prefix}-frontend"
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = azurerm_resource_group.main.name
  revision_mode                = "Single"
  tags                         = local.tags

  registry {
    server               = azurerm_container_registry.acr.login_server
    username             = azurerm_container_registry.acr.admin_username
    password_secret_name = "acr-password"
  }

  secret {
    name  = "acr-password"
    value = azurerm_container_registry.acr.admin_password
  }

  template {
    min_replicas = 1
    max_replicas = 3

    container {
      name   = "frontend"
      image  = "${azurerm_container_registry.acr.login_server}/health-clinics-frontend:latest"
      cpu    = var.frontend_cpu
      memory = var.frontend_memory

      env {
        name  = "BACKEND_HOST"
        value = azurerm_container_app.backend.name
      }
      env {
        name  = "AI_SERVICE_HOST"
        value = azurerm_container_app.ai_service.name
      }
    }
  }

  ingress {
    external_enabled = true
    target_port      = 80
    transport        = "http"

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }
}
